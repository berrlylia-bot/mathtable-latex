import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import MathInput from './MathInput';

/**
 * VariationsRow component
 * Arrow direction selectors, point type selectors, and value inputs for variation table
 */
export default function VariationsRow({
    arrows,
    onArrowsChange,
    values,
    onValuesChange,
    variationPointTypes,
    onVariationPointTypesChange,
    pointCount
}) {
    // Number of intervals is pointCount - 1
    const intervalCount = Math.max(0, pointCount - 1);
    // Number of interior points is pointCount - 2
    const interiorPointCount = Math.max(0, pointCount - 2);

    // Normalize arrows array
    const normalizedArrows = [...arrows];
    while (normalizedArrows.length < intervalCount) {
        normalizedArrows.push('up');
    }
    while (normalizedArrows.length > intervalCount) {
        normalizedArrows.pop();
    }

    // Normalize values array (one value per point)
    const normalizedValues = [...values];
    while (normalizedValues.length < pointCount) {
        normalizedValues.push('');
    }
    while (normalizedValues.length > pointCount) {
        normalizedValues.pop();
    }

    // Normalize variationPointTypes array (for interior points)
    const normalizedPointTypes = [...(variationPointTypes || [])];
    while (normalizedPointTypes.length < interiorPointCount) {
        normalizedPointTypes.push(''); // default to normal (no special type)
    }
    while (normalizedPointTypes.length > interiorPointCount) {
        normalizedPointTypes.pop();
    }

    const updateArrow = (index, direction) => {
        const newArrows = [...normalizedArrows];
        newArrows[index] = direction;
        onArrowsChange(newArrows);
    };

    const updateValue = (index, value) => {
        const newValues = [...normalizedValues];
        newValues[index] = value;
        onValuesChange(newValues);
    };

    const updatePointType = (index, type) => {
        const newPointTypes = [...normalizedPointTypes];
        newPointTypes[index] = type;
        if (onVariationPointTypesChange) {
            onVariationPointTypesChange(newPointTypes);
        }
    };

    const arrowOptions = [
        { value: 'up', label: '↗', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-300', title: 'Increasing' },
        { value: 'down', label: '↘', icon: TrendingDown, color: 'text-red-600 bg-red-50 border-red-300', title: 'Decreasing' },
        { value: 'const', label: '→', icon: ArrowRight, color: 'text-blue-600 bg-blue-50 border-blue-300', title: 'Constant' },
        { value: 'h', label: '∅', icon: null, color: 'text-gray-600 bg-gray-100 border-gray-300', title: 'Undefined' },
    ];

    // Options for point types at interior points
    const pointTypeOptions = [
        { value: '', label: '•', color: 'text-gray-400 bg-white border-gray-200', title: 'Normal point' },
        { value: 'd', label: '∥', color: 'text-purple-600 bg-purple-50 border-purple-300', title: 'Undefined (discontinuity)' },
        { value: 't', label: '┆', color: 'text-orange-600 bg-orange-50 border-orange-300', title: 'Forbidden (asymptote)' },
    ];

    if (intervalCount === 0) {
        return (
            <div className="text-academic-muted text-sm">
                Add at least 2 points to define variation intervals.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <label className="label">
                Variations
                <span className="text-academic-muted font-normal ml-2">(arrow directions and point types)</span>
            </label>

            {/* Arrow selectors */}
            <div className="flex flex-wrap items-center gap-2">
                {normalizedArrows.map((arrow, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {/* First point value input */}
                        {index === 0 && (
                            <div className="w-20">
                                <MathInput
                                    value={normalizedValues[0]}
                                    onChange={(v) => updateValue(0, v)}
                                    placeholder="val"
                                    size="sm"
                                />
                            </div>
                        )}

                        {/* Arrow selector */}
                        <div className="flex rounded-lg overflow-hidden border border-academic-border">
                            {arrowOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => updateArrow(index, option.value)}
                                        className={`
                      px-3 py-2 transition-all duration-200 flex items-center justify-center
                      ${arrow === option.value
                                                ? option.color + ' border-2'
                                                : 'bg-white text-academic-muted hover:bg-gray-50'
                                            }
                    `}
                                        title={option.title}
                                    >
                                        {Icon ? <Icon size={18} /> : <span className="text-sm font-bold">{option.label}</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Interior point: value input + point type selector */}
                        {index < interiorPointCount ? (
                            <div className="flex items-center gap-1">
                                <div className="w-20">
                                    <MathInput
                                        value={normalizedValues[index + 1]}
                                        onChange={(v) => updateValue(index + 1, v)}
                                        placeholder="val"
                                        size="sm"
                                    />
                                </div>
                                {/* Point type selector */}
                                <div className="flex rounded-lg overflow-hidden border border-purple-200">
                                    {pointTypeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updatePointType(index, option.value)}
                                            className={`
                                                px-2 py-1 text-sm font-bold transition-all duration-200
                                                ${normalizedPointTypes[index] === option.value
                                                    ? option.color + ' border-2'
                                                    : 'bg-white text-academic-muted hover:bg-gray-50'
                                                }
                                            `}
                                            title={option.title}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Last point value input */
                            <div className="w-20">
                                <MathInput
                                    value={normalizedValues[index + 1]}
                                    onChange={(v) => updateValue(index + 1, v)}
                                    placeholder="val"
                                    size="sm"
                                />
                            </div>
                        )}

                        {index < intervalCount - 1 && (
                            <div className="w-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-academic-muted">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Arrows:</span>
                    <span className="text-emerald-600">↗</span> increasing
                    <span className="text-red-600 ml-1">↘</span> decreasing
                    <span className="text-blue-600 ml-1">→</span> constant
                    <span className="text-gray-600 ml-1">∅</span> undefined
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">At points:</span>
                    <span className="text-purple-600 font-bold">∥</span> undefined
                    <span className="text-orange-600 font-bold ml-2">┆</span> forbidden
                </div>
            </div>
        </div>
    );
}
