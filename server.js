import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// LaTeX executables - use environment variables or default paths
// On Linux (Docker), these are in PATH. On Windows, use MiKTeX paths.
const PDFLATEX = process.env.PDFLATEX_PATH || (process.platform === 'win32'
    ? 'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe'
    : 'pdflatex');
const PDFTOCAIRO = process.env.PDFTOCAIRO_PATH || (process.platform === 'win32'
    ? 'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdftocairo.exe'
    : 'pdftocairo');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large LaTeX documents

// Global error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON parsing error:', err.message);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    next(err);
});

// Serve static files in production
if (isProduction) {
    app.use(express.static(join(__dirname, 'dist')));
}

/**
 * Execute a command and return a promise
 * allowNonZeroExit: if true, resolve even with non-zero exit code (for commands that print warnings)
 */
function execCommand(command, args, cwd, allowNonZeroExit = false) {
    return new Promise((resolve, reject) => {
        // On Windows with paths containing spaces, we need to quote the command
        const isWindows = process.platform === 'win32';
        let proc;

        if (isWindows) {
            // On Windows, use shell mode with quoted command for paths with spaces
            const quotedCommand = command.includes(' ') ? `"${command}"` : command;
            proc = spawn(quotedCommand, args, { cwd, shell: true });
        } else {
            // On Linux, don't use shell mode for better security
            proc = spawn(command, args, { cwd });
        }

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        proc.on('close', (code) => {
            if (code === 0 || allowNonZeroExit) {
                resolve({ stdout, stderr, exitCode: code });
            } else {
                reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Check if a file exists
 */
async function fileExists(path) {
    try {
        await readFile(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Render LaTeX to PNG
 */
app.post('/api/render', async (req, res) => {
    const { latex } = req.body;

    if (!latex) {
        return res.status(400).json({ error: 'LaTeX code is required' });
    }

    const jobId = randomUUID();
    const workDir = join(tmpdir(), `latex-render-${jobId}`);
    const texFile = join(workDir, 'document.tex');
    const pdfFile = join(workDir, 'document.pdf');
    const pngFile = join(workDir, 'document');

    try {
        // Create work directory
        await mkdir(workDir, { recursive: true });

        // Write LaTeX file
        await writeFile(texFile, latex, 'utf-8');

        // Run pdflatex - allow non-zero exit since it may print warnings
        const pdfResult = await execCommand(
            PDFLATEX,
            ['-interaction=nonstopmode', '-halt-on-error', 'document.tex'],
            workDir,
            true // Allow non-zero exit
        );

        // Check if PDF was actually created
        const pdfExists = await fileExists(pdfFile);
        if (!pdfExists) {
            throw new Error(`LaTeX compilation failed: ${pdfResult.stderr || pdfResult.stdout}`);
        }

        // Convert PDF to PNG using pdftocairo
        // -png for PNG output, -r 300 for 300 DPI, -singlefile for single file output
        await execCommand(
            PDFTOCAIRO,
            ['-png', '-r', '300', '-singlefile', 'document.pdf', 'document'],
            workDir
        );

        // Read the PNG file
        const pngBuffer = await readFile(`${pngFile}.png`);
        const base64 = pngBuffer.toString('base64');

        // Clean up
        await rm(workDir, { recursive: true, force: true });

        res.json({
            success: true,
            image: `data:image/png;base64,${base64}`
        });

    } catch (error) {
        console.error('Render error:', error);

        // Clean up on error
        try {
            await rm(workDir, { recursive: true, force: true });
        } catch { }

        res.status(500).json({
            error: 'Failed to render LaTeX',
            details: error.message
        });
    }
});

// Legacy endpoint for backward compatibility
app.post('/render', (req, res) => {
    req.url = '/api/render';
    app.handle(req, res);
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        platform: process.platform,
        pdflatex: PDFLATEX,
        pdftocairo: PDFTOCAIRO
    });
});

// Serve index.html for all other routes in production (SPA support)
if (isProduction) {
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`Using pdflatex: ${PDFLATEX}`);
    console.log(`Using pdftocairo: ${PDFTOCAIRO}`);
});
