import { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import templates from '../data/templates';

/**
 * TemplateSelector component
 * Dropdown menu to select and load predefined table templates
 */
export default function TemplateSelector({ onSelectTemplate, currentTableType }) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter templates by current table type or show all
    const filteredTemplates = templates.filter(t =>
        t.tableType === currentTableType ||
        t.tableType === 'both' ||
        currentTableType === 'both'
    );

    const handleSelect = (template) => {
        onSelectTemplate(template);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
                <FileText size={16} />
                Templates
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <div className="p-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-semibold text-gray-500 uppercase">
                                Load Template
                            </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelect(template)}
                                    className="w-full text-left px-3 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${template.tableType === 'sign'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : template.tableType === 'variation'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {template.tableType}
                                        </span>
                                        <span className="font-medium text-gray-800 text-sm">
                                            {template.name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {template.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                        {filteredTemplates.length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No templates available for this table type
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
