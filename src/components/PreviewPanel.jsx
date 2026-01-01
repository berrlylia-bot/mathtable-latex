import { useMemo, useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { generateFullDocument } from '../utils/latexGenerator';

// Use relative path in production, localhost in development
const isDev = import.meta.env.DEV;
const RENDER_ENDPOINT = isDev ? 'http://localhost:3001/api/render' : '/api/render';
const useQuickLatexAPI = false;

/**
 * PreviewPanel component
 * Renders a visual representation of the table using MiKTeX (dev) or QuickLaTeX (prod)
 */
export default function PreviewPanel({ tableData, onImageRendered, onRenderingChange, refreshTriggerRef }) {
    const [renderedImage, setRenderedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [useQuickLatex] = useState(useQuickLatexAPI);
    const renderTimeoutRef = useRef(null);

    // Generate LaTeX code - for QuickLaTeX, we only need the tikzpicture body
    const latexCode = useMemo(() => {
        if (useQuickLatex) {
            return generateQuickLatexCode(tableData);
        }
        return generateFullDocument(tableData);
    }, [tableData, useQuickLatex]);

    // Generate code suitable for QuickLaTeX (without document wrapper)
    function generateQuickLatexCode(tableData) {
        // QuickLaTeX needs the tikzpicture content directly
        // The preamble is sent separately via the API
        const fullDoc = generateFullDocument(tableData);

        // Extract just the tikzpicture content
        const match = fullDoc.match(/\\begin{tikzpicture}([\s\S]*?)\\end{tikzpicture}/);
        if (match) {
            return `\\begin{tikzpicture}${match[1]}\\end{tikzpicture}`;
        }
        return fullDoc;
    }

    // Debounced render effect
    useEffect(() => {
        // Clear any pending render
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }

        // Debounce rendering by 500ms to avoid too many requests
        renderTimeoutRef.current = setTimeout(() => {
            renderLatex();
        }, 500);

        return () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
        };
    }, [latexCode]);

    // Expose renderLatex function to parent via ref
    useEffect(() => {
        if (refreshTriggerRef) {
            refreshTriggerRef.current = renderLatex;
        }
    }, [refreshTriggerRef]);

    // Notify parent of loading state changes
    useEffect(() => {
        if (onRenderingChange) {
            onRenderingChange(loading);
        }
    }, [loading, onRenderingChange]);

    const renderLatex = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(RENDER_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latex: latexCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to render');
            }

            // Handle both local server (base64 image) and QuickLaTeX (URL) responses
            if (data.success) {
                const imageSource = data.image || data.imageUrl;
                if (imageSource) {
                    setRenderedImage(imageSource);
                    if (onImageRendered) {
                        onImageRendered(imageSource);
                    }
                } else {
                    throw new Error('No image returned from server');
                }
            } else {
                throw new Error(data.details || data.error || 'Render failed');
            }
        } catch (err) {
            console.error('Render error:', err);
            setError(err.message);
            setRenderedImage(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Rendered Image Preview */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center min-h-[200px]">
                {loading && (
                    <div className="flex flex-col items-center gap-3 py-8 text-gray-400">
                        <RefreshCw size={32} className="animate-spin text-primary-500" />
                        <span className="text-sm">
                            {useQuickLatex ? 'Rendering with QuickLaTeX...' : 'Rendering with MiKTeX...'}
                        </span>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center gap-3 py-8 text-red-500 px-4">
                        <AlertCircle size={32} />
                        <div className="text-center">
                            <p className="font-medium">Render Failed</p>
                            <p className="text-sm text-red-400 mt-1 max-w-md">{error}</p>
                            {isDev && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Make sure the render server is running: <code className="bg-gray-100 px-1 rounded">npm run server</code>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {renderedImage && !loading && !error && (
                    <div className="p-4">
                        <img
                            src={renderedImage}
                            alt="Rendered LaTeX table"
                            className="max-w-full h-auto mx-auto"
                            style={{ imageRendering: 'auto' }}
                        />
                    </div>
                )}

                {!renderedImage && !loading && !error && (
                    <div className="flex flex-col items-center gap-3 py-8 text-gray-400">
                        <RefreshCw size={24} />
                        <span className="text-sm">Click Refresh to render the preview</span>
                    </div>
                )}
            </div>

            {/* QuickLaTeX attribution (required by their terms) */}
            {useQuickLatex && renderedImage && (
                <div className="mt-2 text-center">
                    <a
                        href="https://quicklatex.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
                    >
                        Powered by QuickLaTeX
                        <ExternalLink size={10} />
                    </a>
                </div>
            )}
        </div>
    );
}
