import { useState } from 'react';
import { Download, Copy, Check, ExternalLink, FileDown } from 'lucide-react';
import { generateFullDocument, generateTikzSnippet } from '../utils/latexGenerator';

/**
 * ExportButton component
 * Provides options to copy LaTeX code and export
 */
export default function ExportButton({ tableData }) {
    const [copied, setCopied] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);

    const fullCode = generateFullDocument(tableData);
    const snippetCode = generateTikzSnippet(tableData);

    const copyFull = async () => {
        try {
            await navigator.clipboard.writeText(fullCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const copySnippet = async () => {
        try {
            await navigator.clipboard.writeText(snippetCode);
            setCopiedSnippet(true);
            setTimeout(() => setCopiedSnippet(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const downloadTex = () => {
        const blob = new Blob([fullCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'math_table.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={copyFull}
                    className="btn-success"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Full Document'}
                </button>

                <button
                    onClick={copySnippet}
                    className="btn-secondary"
                >
                    {copiedSnippet ? <Check size={18} /> : <Copy size={18} />}
                    {copiedSnippet ? 'Copied!' : 'Copy Snippet Only'}
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={downloadTex}
                    className="btn-secondary"
                >
                    <FileDown size={18} />
                    Download .tex
                </button>

                <a
                    href="https://www.overleaf.com/project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                >
                    <ExternalLink size={18} />
                    Open Overleaf
                </a>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>How to use:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                    <li>Click <strong>Copy Full Document</strong> to copy the complete LaTeX code</li>
                    <li>Go to <strong>Overleaf</strong> and create a new blank project</li>
                    <li>Paste the code and click <strong>Recompile</strong></li>
                    <li>Download the PDF or screenshot the rendered table</li>
                </ol>
            </div>
        </div>
    );
}
