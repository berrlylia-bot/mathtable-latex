import { Plus, X, GripVertical } from 'lucide-react';
import MathInput from './MathInput';

/**
 * PointsRow component
 * Dynamic list for managing key points (critical values)
 */
export default function PointsRow({ points, onPointsChange }) {
    const addPoint = () => {
        const newPoints = [...points, ''];
        onPointsChange(newPoints);
    };

    const removePoint = (index) => {
        if (points.length <= 2) return; // Minimum 2 points
        const newPoints = points.filter((_, i) => i !== index);
        onPointsChange(newPoints);
    };

    const updatePoint = (index, value) => {
        const newPoints = [...points];
        newPoints[index] = value;
        onPointsChange(newPoints);
    };

    // Preset quick-add buttons
    const presets = [
        { label: '-∞', value: '-\\infty' },
        { label: '+∞', value: '+\\infty' },
        { label: '0', value: '0' },
        { label: '1', value: '1' },
        { label: '-1', value: '-1' },
    ];

    const addPreset = (value) => {
        // Insert before the last element (usually +∞)
        const insertIndex = points.length > 1 ? points.length - 1 : points.length;
        const newPoints = [...points];
        newPoints.splice(insertIndex, 0, value);
        onPointsChange(newPoints);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="label mb-0">
                    Key Points
                    <span className="text-academic-muted font-normal ml-2">(critical values, asymptotes)</span>
                </label>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-academic-muted mr-2">Quick add:</span>
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => addPreset(preset.value)}
                            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-academic-text transition-colors"
                            title={`Add ${preset.label}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                {points.map((point, index) => (
                    <div key={index} className="flex items-center gap-1 group">
                        <div className="flex items-center bg-gray-50 rounded-lg border border-academic-border overflow-hidden">
                            <div className="px-1.5 py-2 text-academic-muted cursor-grab hover:text-academic-text">
                                <GripVertical size={14} />
                            </div>

                            <div className="w-24">
                                <MathInput
                                    value={point}
                                    onChange={(value) => updatePoint(index, value)}
                                    placeholder={`x_${index}`}
                                    size="sm"
                                />
                            </div>

                            {points.length > 2 && (
                                <button
                                    onClick={() => removePoint(index)}
                                    className="px-2 py-2 text-academic-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Remove point"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {index < points.length - 1 && (
                            <span className="text-academic-muted mx-1">&lt;</span>
                        )}
                    </div>
                ))}

                <button
                    onClick={addPoint}
                    className="btn-icon border border-dashed border-academic-border rounded-lg px-3 py-2"
                    title="Add point"
                >
                    <Plus size={18} />
                    <span className="text-sm ml-1">Add</span>
                </button>
            </div>

            <p className="text-xs text-academic-muted">
                Points should be ordered from left to right. Use LaTeX notation for special symbols.
            </p>
        </div>
    );
}
