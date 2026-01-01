import { useState } from 'react';
import { Copy, Check, FileCode, FileText } from 'lucide-react';
import { generateFullDocument, generateTikzSnippet } from '../utils/latexGenerator';

/**
 * CodeView component
 * Displays the generated LaTeX code with syntax highlighting
 */
export default function CodeView({ tableData }) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('full'); // 'full' or 'snippet'

    const code = viewMode === 'full'
        ? generateFullDocument(tableData)
        : generateTikzSnippet(tableData);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Simple syntax highlighting
    const highlightCode = (code) => {
        return code
            .split('\n')
            .map((line, index) => {
                let highlighted = line
                    // LaTeX commands
                    .replace(/(\\[a-zA-Z]+)/g, '<span class="text-blue-400">$1</span>')
                    // Braces and brackets
                    .replace(/([{}[\]])/g, '<span class="text-yellow-400">$1</span>')
                    // Math delimiters
                    .replace(/(\$[^$]*\$)/g, '<span class="text-emerald-400">$1</span>')
                    // Comments
                    .replace(/(%.*)$/g, '<span class="text-gray-500">$1</span>');

                return (
                    <div key={index} className="flex">
                        <span className="text-gray-600 select-none w-8 text-right pr-4 flex-shrink-0">
                            {index + 1}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                    </div>
                );
            });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="label mb-0">LaTeX Code</label>

                <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-academic-border">
                        <button
                            onClick={() => setViewMode('full')}
                            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'full'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-academic-muted hover:bg-gray-50'
                                }`}
                            title="Full document (standalone)"
                        >
                            <FileText size={14} />
                            Full
                        </button>
                        <button
                            onClick={() => setViewMode('snippet')}
                            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'snippet'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-academic-muted hover:bg-gray-50'
                                }`}
                            title="TikZ snippet only"
                        >
                            <FileCode size={14} />
                            Snippet
                        </button>
                    </div>

                    {/* Copy button */}
                    <button
                        onClick={copyToClipboard}
                        className={`btn-secondary text-sm ${copied ? 'text-emerald-600' : ''}`}
                    >
                        {copied ? (
                            <>
                                <Check size={16} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="code-block max-h-96 overflow-auto">
                <pre className="text-sm leading-relaxed">
                    {highlightCode(code)}
                </pre>
            </div>

            <p className="text-xs text-academic-muted">
                {viewMode === 'full'
                    ? 'Complete standalone document. Compile with pdflatex.'
                    : 'TikZ snippet only. Include in your existing document.'
                }
            </p>
        </div>
    );
}
