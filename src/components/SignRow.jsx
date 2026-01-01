import { Plus, Minus, Circle, Slash, MoreHorizontal } from 'lucide-react';

/**
 * SignRow component
 * Shows interval signs AND point values for a complete sign table
 * 
 * For n points, we have:
 * - n-1 intervals (with + or - signs)
 * - n-2 interior points (can be empty, z=zero, d=undefined, t=dashed)
 */
export default function SignRow({
    signs,
    onSignsChange,
    pointSigns,
    onPointSignsChange,
    pointCount,
    points = []
}) {
    // Number of intervals is pointCount - 1
    const intervalCount = Math.max(0, pointCount - 1);
    // Number of interior points (not first or last) is pointCount - 2
    const interiorPointCount = Math.max(0, pointCount - 2);

    // Ensure we have the right number of signs
    const normalizedSigns = [...signs];
    while (normalizedSigns.length < intervalCount) {
        normalizedSigns.push('+');
    }
    while (normalizedSigns.length > intervalCount) {
        normalizedSigns.pop();
    }

    // Ensure we have the right number of point signs
    const normalizedPointSigns = [...(pointSigns || [])];
    while (normalizedPointSigns.length < interiorPointCount) {
        normalizedPointSigns.push('z'); // default to zero
    }
    while (normalizedPointSigns.length > interiorPointCount) {
        normalizedPointSigns.pop();
    }

    const updateSign = (index, value) => {
        const newSigns = [...normalizedSigns];
        newSigns[index] = value;
        onSignsChange(newSigns);
    };

    const updatePointSign = (index, value) => {
        const newPointSigns = [...normalizedPointSigns];
        newPointSigns[index] = value;
        if (onPointSignsChange) {
            onPointSignsChange(newPointSigns);
        }
    };

    // Options for interval signs (+, -, or undefined)
    const intervalOptions = [
        { value: '+', label: '+', color: 'text-emerald-600 bg-emerald-50 border-emerald-300', title: 'Positive' },
        { value: '-', label: '−', color: 'text-red-600 bg-red-50 border-red-300', title: 'Negative' },
        { value: 'h', label: '∅', color: 'text-gray-600 bg-gray-100 border-gray-300', title: 'Undefined (not defined)' },
    ];

    // Options for point values (at critical points)
    const pointOptions = [
        { value: 'z', label: '0', color: 'text-blue-600 bg-blue-50 border-blue-300', title: 'Zero (function = 0)' },
        { value: 'd', label: '∥', color: 'text-purple-600 bg-purple-50 border-purple-300', title: 'Undefined (discontinuity)' },
        { value: 't', label: '┆', color: 'text-orange-600 bg-orange-50 border-orange-300', title: 'Forbidden (asymptote)' },
    ];

    // Format point label for display
    const formatPointLabel = (point) => {
        if (!point) return '?';
        return point
            .replace(/\\infty/g, '∞')
            .replace(/\+\\infty/g, '+∞')
            .replace(/-\\infty/g, '-∞')
            .replace(/\\/g, '');
    };

    if (intervalCount === 0) {
        return (
            <div className="text-academic-muted text-sm">
                Add at least 2 points to define sign intervals.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Visual representation */}
            <div className="bg-gray-50 rounded-lg p-4 border border-academic-border">
                <div className="flex items-center justify-center gap-1 flex-wrap">
                    {normalizedSigns.map((sign, index) => (
                        <div key={index} className="flex items-center gap-1">
                            {/* Point label */}
                            <div className="text-xs text-academic-muted font-mono bg-white px-2 py-1 rounded border min-w-[40px] text-center">
                                {formatPointLabel(points[index])}
                            </div>

                            {/* Interval sign selector */}
                            <div className="flex rounded-lg overflow-hidden border-2 border-academic-border shadow-sm">
                                {intervalOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateSign(index, option.value)}
                                        className={`
                                            px-3 py-2 text-lg font-bold transition-all duration-200
                                            ${sign === option.value
                                                ? option.color + ' border-2'
                                                : 'bg-white text-academic-muted hover:bg-gray-100'
                                            }
                                        `}
                                        title={option.title}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* Interior point value selector (if not last interval) */}
                            {index < interiorPointCount && (
                                <>
                                    {/* Point label */}
                                    <div className="text-xs text-academic-muted font-mono bg-white px-2 py-1 rounded border min-w-[40px] text-center">
                                        {formatPointLabel(points[index + 1])}
                                    </div>

                                    {/* Point value selector */}
                                    <div className="flex rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                                        {pointOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => updatePointSign(index, option.value)}
                                                className={`
                                                    px-2 py-2 text-sm font-bold transition-all duration-200
                                                    ${normalizedPointSigns[index] === option.value
                                                        ? option.color + ' border-2'
                                                        : 'bg-white text-academic-muted hover:bg-gray-100'
                                                    }
                                                `}
                                                title={option.title}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Last point label */}
                            {index === intervalCount - 1 && (
                                <div className="text-xs text-academic-muted font-mono bg-white px-2 py-1 rounded border min-w-[40px] text-center">
                                    {formatPointLabel(points[index + 1])}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-academic-muted">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Intervals:</span>
                    <span className="text-emerald-600 font-bold">+</span> positive
                    <span className="text-red-600 font-bold ml-2">−</span> negative
                    <span className="text-gray-600 font-bold ml-2">∅</span> undefined
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">At points:</span>
                    <span className="text-blue-600 font-bold">0</span> zero
                    <span className="text-purple-600 font-bold ml-2">∥</span> undefined
                    <span className="text-orange-600 font-bold ml-2">┆</span> forbidden
                </div>
            </div>
        </div>
    );
}
