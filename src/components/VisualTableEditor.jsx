import { Plus, X, GripVertical } from 'lucide-react';
import MathTableCell from './MathTableCell';

/**
 * VisualTableEditor component
 * A modern table-like editor that mirrors the final output structure
 * Layout: values | sign | values | sign | values (signs between values)
 */
export default function VisualTableEditor({
    variable,
    onVariableChange,
    points,
    onPointsChange,
    expressions,
    onExpressionsChange,
    arrows,
    onArrowsChange,
    values,
    onValuesChange,
    variationLeftValues,
    onVariationLeftValuesChange,
    variationPointTypes,
    onVariationPointTypesChange,
    variationFunctionName,
    onVariationFunctionNameChange,
    tableType
}) {
    const intervalCount = Math.max(0, points.length - 1);
    const includeSign = tableType === 'sign' || tableType === 'both';
    const includeVariation = tableType === 'variation' || tableType === 'both';

    // Format point for display
    const formatPoint = (point) => {
        if (!point) return '';
        return point
            .replace(/\\infty/g, '∞')
            .replace(/\+\\infty/g, '+∞')
            .replace(/-\\infty/g, '-∞')
            .replace(/\\/g, '');
    };

    // Add a new expression line
    const addExpression = () => {
        const newExpr = {
            name: `f_${expressions.length + 1}(x)`,
            signs: Array(intervalCount).fill('+'),
            pointTypes: Array(points.length).fill('n') // n = no line for all points
        };
        onExpressionsChange([...expressions, newExpr]);
    };

    // Remove an expression line
    const removeExpression = (index) => {
        const newExpressions = expressions.filter((_, i) => i !== index);
        onExpressionsChange(newExpressions);
    };

    // Update expression name
    const updateExpressionName = (index, name) => {
        const newExpressions = [...expressions];
        newExpressions[index] = { ...newExpressions[index], name };
        onExpressionsChange(newExpressions);
    };

    // Toggle sign in expression (+ -> - -> h -> +)
    const toggleSign = (exprIndex, signIndex) => {
        const newExpressions = [...expressions];
        const signs = [...newExpressions[exprIndex].signs];
        const cycle = ['+', '-', 'h'];
        const current = cycle.indexOf(signs[signIndex]);
        signs[signIndex] = cycle[(current + 1) % cycle.length];
        newExpressions[exprIndex] = { ...newExpressions[exprIndex], signs };
        onExpressionsChange(newExpressions);
    };

    // Toggle point type (z=zero, d=undefined, t=forbidden, n=no line)
    const togglePointType = (exprIndex, pointIndex) => {
        const newExpressions = [...expressions];
        const pointTypes = [...(newExpressions[exprIndex].pointTypes || Array(points.length).fill('n'))];
        const cycle = ['n', 'z', 'd', 't'];
        const current = cycle.indexOf(pointTypes[pointIndex]);
        pointTypes[pointIndex] = cycle[(current + 1) % cycle.length];
        newExpressions[exprIndex] = { ...newExpressions[exprIndex], pointTypes };
        onExpressionsChange(newExpressions);
    };

    // Toggle arrow direction (up -> down -> h -> up)
    const toggleArrow = (index) => {
        const newArrows = [...arrows];
        const cycle = ['up', 'down', 'h'];
        const current = cycle.indexOf(newArrows[index]);
        newArrows[index] = cycle[(current + 1) % cycle.length];
        onArrowsChange(newArrows);
    };

    // Update point value
    const updatePoint = (index, value) => {
        const newPoints = [...points];
        newPoints[index] = value;
        onPointsChange(newPoints);
    };

    // Update variation value at point (right value for double bar)
    const updateValue = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        onValuesChange(newValues);
    };

    // Update left value at point (for double bar points)
    const updateLeftValue = (index, value) => {
        if (!onVariationLeftValuesChange || !variationLeftValues) return;
        const newLeftValues = [...variationLeftValues];
        newLeftValues[index] = value;
        onVariationLeftValuesChange(newLeftValues);
    };

    // Toggle variation point type (n=normal, d=double bar)
    const toggleVariationPointType = (index) => {
        if (!onVariationPointTypesChange || !variationPointTypes) return;
        const newTypes = [...variationPointTypes];
        newTypes[index] = newTypes[index] === 'n' ? 'd' : 'n';
        onVariationPointTypesChange(newTypes);
    };

    // Add a new column (point)
    const addColumn = () => {
        const newPoints = [...points];
        newPoints.splice(points.length - 1, 0, '');
        onPointsChange(newPoints);
    };

    // Remove a column (point)
    const removeColumn = (index) => {
        if (points.length <= 2) return;
        const newPoints = points.filter((_, i) => i !== index);
        onPointsChange(newPoints);
    };

    // Get display for point type
    const getPointTypeDisplay = (type) => {
        switch (type) {
            case 'z': return '0';
            case 'd': return '∥';
            case 't': return '┆';
            case 'n': return '·';
            default: return '·';
        }
    };

    // Get color classes for point type
    const getPointTypeClasses = (type) => {
        switch (type) {
            case 'z': return 'text-blue-600 bg-blue-50/80 hover:bg-blue-100 border-blue-200';
            case 'd': return 'text-purple-600 bg-purple-50/80 hover:bg-purple-100 border-purple-200';
            case 't': return 'text-orange-600 bg-orange-50/80 hover:bg-orange-100 border-orange-200';
            case 'n': return 'text-gray-400 bg-gray-50/50 hover:bg-gray-100 border-gray-200';
            default: return 'text-gray-400 bg-gray-50/50 hover:bg-gray-100 border-gray-200';
        }
    };

    // Build alternating columns: point | interval | point | interval | point
    const buildColumns = () => {
        const cols = [];
        for (let i = 0; i < points.length; i++) {
            cols.push({ type: 'point', index: i });
            if (i < points.length - 1) {
                cols.push({ type: 'interval', index: i });
            }
        }
        return cols;
    };

    const columns = buildColumns();

    return (
        <div className="space-y-5">
            {/* The Visual Table - Modern Design */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-sm">
                    {/* Header Row - Variable and Points with intervals */}
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-gray-50">
                            <th className="border-b border-r border-gray-200 p-2 min-w-[90px]">
                                <MathTableCell
                                    value={variable}
                                    onChange={onVariableChange}
                                    placeholder="x"
                                />
                            </th>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`border-b border-r border-gray-200 p-2 ${col.type === 'point' ? 'min-w-[70px]' : 'min-w-[55px] bg-gray-50/50'} relative group`}
                                >
                                    {col.type === 'point' ? (
                                        <>
                                            <MathTableCell
                                                value={points[col.index]}
                                                onChange={(val) => updatePoint(col.index, val)}
                                                placeholder="val"
                                            />
                                            {points.length > 2 && (
                                                <button
                                                    onClick={() => removeColumn(col.index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 hover:scale-110 transition-all duration-200 border-2 border-white"
                                                    title="Remove column"
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gray-300 text-xs font-light">—</span>
                                    )}
                                </th>
                            ))}
                            <th className="border-b border-gray-200 p-2 w-10">
                                <button
                                    onClick={addColumn}
                                    className="w-full h-full flex items-center justify-center text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg py-1 transition-all duration-200"
                                    title="Add column"
                                >
                                    <Plus size={16} />
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* Expression Lines (Sign rows) */}
                        {includeSign && expressions.map((expr, exprIndex) => (
                            <tr key={exprIndex} className="hover:bg-blue-50/30 transition-colors duration-150">
                                <td className="border-b border-r border-gray-200 p-2 relative group bg-white">
                                    <MathTableCell
                                        value={expr.name}
                                        onChange={(value) => updateExpressionName(exprIndex, value)}
                                        placeholder="f(x)"
                                    />
                                    {expressions.length > 1 && (
                                        <button
                                            onClick={() => removeExpression(exprIndex)}
                                            className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 hover:scale-110 transition-all duration-200 border-2 border-white"
                                            title="Remove expression line"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </td>
                                {columns.map((col, idx) => {
                                    const pointTypes = expr.pointTypes || Array(points.length).fill('n');

                                    if (col.type === 'point') {
                                        // Point column - show point type (z, d, t, n)
                                        return (
                                            <td key={idx} className="border-b border-r border-gray-200 p-0">
                                                <button
                                                    onClick={() => togglePointType(exprIndex, col.index)}
                                                    className={`w-full h-full py-3 font-bold text-lg transition-all duration-200 ${getPointTypeClasses(pointTypes[col.index])}`}
                                                    title="Click: n=none, z=zero, d=undefined, t=forbidden"
                                                >
                                                    {getPointTypeDisplay(pointTypes[col.index])}
                                                </button>
                                            </td>
                                        );
                                    } else {
                                        // Interval column - show sign (+/-/h)
                                        const sign = expr.signs[col.index];
                                        const isHatched = sign === 'h';
                                        return (
                                            <td key={idx} className={`border-b border-r border-gray-200 p-0 ${isHatched ? '' : 'bg-gray-50/30'}`}>
                                                <button
                                                    onClick={() => toggleSign(exprIndex, col.index)}
                                                    className={`w-full h-full py-3 font-bold text-xl transition-all duration-200 ${isHatched
                                                        ? 'text-gray-400'
                                                        : sign === '+'
                                                            ? 'text-emerald-600 hover:bg-emerald-50'
                                                            : 'text-red-500 hover:bg-red-50'
                                                        }`}
                                                    title="Click to toggle +/−/h(hatched)"
                                                    style={isHatched ? {
                                                        background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #f1f5f9 3px, #f1f5f9 6px)'
                                                    } : {}}
                                                >
                                                    {isHatched ? '▧' : sign === '+' ? '+' : '−'}
                                                </button>
                                            </td>
                                        );
                                    }
                                })}
                                <td className="border-b border-gray-200"></td>
                            </tr>
                        ))}

                        {/* Add Expression Button Row */}
                        {includeSign && (
                            <tr className="bg-gray-50/30">
                                <td colSpan={columns.length + 2} className="border-b border-gray-200 p-1">
                                    <button
                                        onClick={addExpression}
                                        className="w-full flex items-center justify-center gap-2 py-2 text-primary-500 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 text-sm font-medium rounded-lg"
                                    >
                                        <Plus size={16} />
                                        Add expression line
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Variation Row */}
                        {includeVariation && (
                            <tr className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                                <td className="border-b border-r border-gray-200 p-2 bg-white/50">
                                    <MathTableCell
                                        value={variationFunctionName || 'f(x)'}
                                        onChange={onVariationFunctionNameChange}
                                        placeholder="f(x)"
                                    />
                                </td>
                                {columns.map((col, idx) => {
                                    if (col.type === 'point') {
                                        // Point column - show value input AND type toggle
                                        const type = variationPointTypes ? variationPointTypes[col.index] : 'n';

                                        return (
                                            <td key={idx} className={`border-b border-r border-gray-200 p-1.5 relative group ${type === 'd' ? 'bg-purple-50/50' : ''}`}>
                                                <div className="flex flex-col items-center gap-1">
                                                    {type === 'd' ? (
                                                        // Double bar mode
                                                        col.index === points.length - 1 ? (
                                                            // End point: only one input (value before the bar)
                                                            <>
                                                                <MathTableCell
                                                                    value={variationLeftValues ? variationLeftValues[col.index] || '' : ''}
                                                                    onChange={(val) => updateLeftValue(col.index, val)}
                                                                    placeholder="val"
                                                                />
                                                                <div className="w-full h-0.5 bg-purple-400 rounded-full my-0.5"></div>
                                                            </>
                                                        ) : col.index === 0 ? (
                                                            // Start point: only one input (value after the bar)
                                                            <>
                                                                <div className="w-full h-0.5 bg-purple-400 rounded-full my-0.5"></div>
                                                                <MathTableCell
                                                                    value={values[col.index] || ''}
                                                                    onChange={(val) => updateValue(col.index, val)}
                                                                    placeholder="val"
                                                                />
                                                            </>
                                                        ) : (
                                                            // Middle point: two inputs (left value / right value)
                                                            <>
                                                                <MathTableCell
                                                                    value={variationLeftValues ? variationLeftValues[col.index] || '' : ''}
                                                                    onChange={(val) => updateLeftValue(col.index, val)}
                                                                    placeholder="left"
                                                                />
                                                                <div className="w-full h-0.5 bg-purple-400 rounded-full my-0.5"></div>
                                                                <MathTableCell
                                                                    value={values[col.index] || ''}
                                                                    onChange={(val) => updateValue(col.index, val)}
                                                                    placeholder="right"
                                                                />
                                                            </>
                                                        )
                                                    ) : (
                                                        // Normal point: single input
                                                        <MathTableCell
                                                            value={values[col.index] || ''}
                                                            onChange={(val) => updateValue(col.index, val)}
                                                            placeholder="val"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => toggleVariationPointType(col.index)}
                                                        className={`w-full py-0.5 rounded text-[9px] flex items-center justify-center font-bold transition-all duration-200 ${type === 'n' ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                                                        title="Toggle double bar"
                                                    >
                                                        {type === 'd' ? '∥' : '—'}
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    } else {
                                        // Interval column - show arrow (up/down/h)
                                        const arrow = arrows[col.index];
                                        const isHatched = arrow === 'h';
                                        return (
                                            <td key={idx} className="border-b border-r border-gray-200 p-0 bg-white/30">
                                                <button
                                                    onClick={() => toggleArrow(col.index)}
                                                    className={`w-full h-full py-3 font-bold text-2xl transition-all duration-200 ${isHatched
                                                        ? 'text-gray-400'
                                                        : arrow === 'up'
                                                            ? 'text-emerald-600 hover:bg-emerald-50'
                                                            : 'text-red-500 hover:bg-red-50'
                                                        }`}
                                                    title="Click to toggle ↗/↘/▧(forbidden)"
                                                    style={isHatched ? {
                                                        background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #f1f5f9 3px, #f1f5f9 6px)'
                                                    } : {}}
                                                >
                                                    {isHatched ? '▧' : arrow === 'up' ? '↗' : '↘'}
                                                </button>
                                            </td>
                                        );
                                    }
                                })}
                                <td className="border-b border-gray-200"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Legend - Modern Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 font-medium">Click to toggle:</span>
                {includeSign && (
                    <>
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                            <span className="font-bold">+</span> / <span className="text-red-600 font-bold">−</span>
                        </span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                            <span className="font-bold">0</span> zero
                        </span>
                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-medium">
                            <span className="font-bold">∥</span> undefined
                        </span>
                        <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full font-medium">
                            <span className="font-bold">┆</span> forbidden
                        </span>
                    </>
                )}
                {includeVariation && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                        <span className="text-emerald-600">↗</span> / <span className="text-red-500">↘</span>
                    </span>
                )}
            </div>
        </div>
    );
}
