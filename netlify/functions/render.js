/**
 * Netlify Function: LaTeX Render via QuickLaTeX API
 * Proxies requests to QuickLaTeX to avoid CORS issues
 */

export async function handler(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { latex } = JSON.parse(event.body);

        if (!latex) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'LaTeX code is required' })
            };
        }

        // QuickLaTeX API endpoint
        const QUICKLATEX_URL = 'https://quicklatex.com/latex3.f';

        // Custom preamble for tkz-tab package
        // Note: tkz-tab requires specific setup
        const preamble = `\\usepackage{tikz}
\\usetikzlibrary{arrows,patterns}
\\usepackage{tkz-tab}
\\tikzset{h style/.style={pattern=north west lines}}`;

        // Build the request body for QuickLaTeX
        // QuickLaTeX uses form-encoded data
        const formData = new URLSearchParams();
        formData.append('formula', latex);
        formData.append('fsize', '17px');           // Font size
        formData.append('fcolor', '000000');        // Font color (black)
        formData.append('mode', '0');               // 0 = display mode
        formData.append('out', '1');                // 1 = return URL
        formData.append('remhost', 'quicklatex.com');
        formData.append('preamble', preamble);

        // Debug logging
        console.log('=== QuickLaTeX Request ===');
        console.log('LaTeX code:', latex.substring(0, 500));
        console.log('Preamble:', preamble);

        // Make request to QuickLaTeX
        const response = await fetch(QUICKLATEX_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        const responseText = await response.text();

        // Debug logging
        console.log('=== QuickLaTeX Response ===');
        console.log('Raw response:', responseText);

        // QuickLaTeX returns a plain text response
        // Format: status\r\nurl width height baseline\r\nerror_message (if any)
        const lines = responseText.trim().split('\n');
        const status = lines[0].trim();

        console.log('Status:', status);
        console.log('Lines:', lines);

        if (status === '0') {
            // Success - parse the image URL
            const parts = lines[1].trim().split(' ');
            const imageUrl = parts[0];

            console.log('Image URL:', imageUrl);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    imageUrl: imageUrl
                })
            };
        } else {
            // Error - return error message
            const errorMessage = lines.slice(1).join('\n');
            console.log('Error message:', errorMessage);

            return {
                statusCode: 200, // Return 200 with error details so client can show them
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'LaTeX compilation failed',
                    details: errorMessage,
                    rawResponse: responseText
                })
            };
        }

    } catch (error) {
        console.error('Render error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Failed to render LaTeX',
                details: error.message
            })
        };
    }
}
