import { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import VisualTableEditor from './VisualTableEditor';
import PreviewPanel from './PreviewPanel';

/**
 * TableGenerator component
 * Main component with side-by-side visual table editor and preview
 */
export default function TableGenerator({ tableType, onTableDataChange, onImageRendered, onRenderingChange, refreshTriggerRef }) {
    // Table configuration state
    const [variable, setVariable] = useState('x');
    const [points, setPoints] = useState(['-\\infty', '0', '+\\infty']);
    const [arrows, setArrows] = useState(['up', 'down']);
    const [values, setValues] = useState(['', '', '']);
    // Left values for double bar points (value before the discontinuity)
    const [variationLeftValues, setVariationLeftValues] = useState(['', '', '']);
    // Variation row point types ('n' = normal, 'd' = double bar/undefined)
    const [variationPointTypes, setVariationPointTypes] = useState(['n', 'n', 'n']);
    // Variation function name (editable)
    const [variationFunctionName, setVariationFunctionName] = useState('f(x)');

    // Layout configuration for TikZ-tab
    const [layoutConfig, setLayoutConfig] = useState({
        lgt: 2,      // First column width (variable column) in cm
        espcl: 2,    // Column spacing in cm
        deltacl: 0.5 // Delta/padding in cm
    });
    const [showLayoutConfig, setShowLayoutConfig] = useState(false);

    // Expression lines (for sign table)
    // pointTypes: array of point types for ALL points (including first/last)
    // 'n' = no line, 'z' = zero, 'd' = undefined, 't' = forbidden
    const [expressions, setExpressions] = useState([
        {
            name: 'f(x)',
            signs: ['+', '-'],
            pointTypes: ['n', 'z', 'n'] // one per point
        }
    ]);

    // Build table data object for generators
    const tableData = {
        variable,
        functionName: expressions[0]?.name || 'f(x)',
        points,
        signs: expressions[0]?.signs || [],
        pointSigns: expressions[0]?.pointTypes?.slice(1, -1) || [], // interior points for backward compat
        arrows,
        values,
        variationLeftValues,
        variationPointTypes,
        variationFunctionName,
        expressions,
        tableType,
        layoutConfig, // Include layout config in table data
    };

    // Notify parent of table data changes
    useEffect(() => {
        if (onTableDataChange) {
            onTableDataChange(tableData);
        }
    }, [variable, points, arrows, values, variationLeftValues, variationPointTypes, variationFunctionName, expressions, tableType, layoutConfig]);

    // Handle layout config change
    const handleLayoutChange = (key, value) => {
        const numValue = parseFloat(value) || 0;
        setLayoutConfig(prev => ({
            ...prev,
            [key]: numValue
        }));
    };

    // Handle points change - adjust expression arrays
    const handlePointsChange = (newPoints) => {
        setPoints(newPoints);

        const newIntervalCount = Math.max(0, newPoints.length - 1);

        // Adjust arrows
        const newArrows = [...arrows];
        while (newArrows.length < newIntervalCount) newArrows.push('up');
        while (newArrows.length > newIntervalCount) newArrows.pop();
        setArrows(newArrows);

        // Adjust values (right values for double bar)
        const newValues = [...values];
        while (newValues.length < newPoints.length) newValues.push('');
        while (newValues.length > newPoints.length) newValues.pop();
        setValues(newValues);

        // Adjust left values (for double bar points)
        const newLeftValues = [...variationLeftValues];
        while (newLeftValues.length < newPoints.length) newLeftValues.push('');
        while (newLeftValues.length > newPoints.length) newLeftValues.pop();
        setVariationLeftValues(newLeftValues);

        // Adjust variation point types
        const newVariationTypes = [...variationPointTypes];
        while (newVariationTypes.length < newPoints.length) newVariationTypes.push('n');
        while (newVariationTypes.length > newPoints.length) newVariationTypes.pop();
        setVariationPointTypes(newVariationTypes);

        // Adjust each expression's signs and pointTypes
        const newExpressions = expressions.map(expr => {
            const newSigns = [...expr.signs];
            while (newSigns.length < newIntervalCount) newSigns.push('+');
            while (newSigns.length > newIntervalCount) newSigns.pop();

            const newPointTypes = [...(expr.pointTypes || Array(newPoints.length).fill('n'))];
            while (newPointTypes.length < newPoints.length) newPointTypes.push('n');
            while (newPointTypes.length > newPoints.length) newPointTypes.pop();

            return { ...expr, signs: newSigns, pointTypes: newPointTypes };
        });
        setExpressions(newExpressions);
    };

    // Handle expressions change - ensure proper array sizes
    const handleExpressionsChange = (newExpressions) => {
        const intervalCount = Math.max(0, points.length - 1);

        const normalized = newExpressions.map(expr => {
            const signs = [...(expr.signs || [])];
            while (signs.length < intervalCount) signs.push('+');
            while (signs.length > intervalCount) signs.pop();

            const pointTypes = [...(expr.pointTypes || Array(points.length).fill('n'))];
            while (pointTypes.length < points.length) pointTypes.push('n');
            while (pointTypes.length > points.length) pointTypes.pop();

            return { ...expr, signs, pointTypes };
        });

        setExpressions(normalized);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
            {/* Editor Panel - Takes 3 columns (60%) */}
            <div className="lg:col-span-3 overflow-y-auto">
                <div className="card h-full">
                    <VisualTableEditor
                        variable={variable}
                        onVariableChange={setVariable}
                        points={points}
                        onPointsChange={handlePointsChange}
                        expressions={expressions}
                        onExpressionsChange={handleExpressionsChange}
                        arrows={arrows}
                        onArrowsChange={setArrows}
                        values={values}
                        onValuesChange={setValues}
                        variationLeftValues={variationLeftValues}
                        onVariationLeftValuesChange={setVariationLeftValues}
                        variationPointTypes={variationPointTypes}
                        onVariationPointTypesChange={setVariationPointTypes}
                        variationFunctionName={variationFunctionName}
                        onVariationFunctionNameChange={setVariationFunctionName}
                        tableType={tableType}
                    />
                </div>
            </div>

            {/* Preview Panel - Takes 2 columns (40%) */}
            <div className="lg:col-span-2 overflow-y-auto space-y-4">
                <div className="card h-auto">
                    <PreviewPanel
                        tableData={tableData}
                        onImageRendered={onImageRendered}
                        onRenderingChange={onRenderingChange}
                        refreshTriggerRef={refreshTriggerRef}
                    />
                </div>

                {/* Layout Configuration Panel */}
                <div className="card">
                    <button
                        onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                        className="w-full flex items-center justify-between text-left py-2 px-1 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Settings size={18} className="text-gray-500" />
                            <span className="font-medium text-sm">Layout Settings</span>
                        </div>
                        {showLayoutConfig ? (
                            <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                        )}
                    </button>

                    {showLayoutConfig && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                            {/* lgt - First column width */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-600">
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary-600">lgt</code>
                                    <span className="ml-2 text-gray-500">Variable column width</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={layoutConfig.lgt}
                                        onChange={(e) => handleLayoutChange('lgt', e.target.value)}
                                        step="0.5"
                                        min="0.5"
                                        max="10"
                                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none"
                                    />
                                    <span className="text-xs text-gray-400">cm</span>
                                </div>
                            </div>

                            {/* espcl - Column spacing */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-600">
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary-600">espcl</code>
                                    <span className="ml-2 text-gray-500">Column spacing</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={layoutConfig.espcl}
                                        onChange={(e) => handleLayoutChange('espcl', e.target.value)}
                                        step="0.5"
                                        min="0.5"
                                        max="10"
                                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none"
                                    />
                                    <span className="text-xs text-gray-400">cm</span>
                                </div>
                            </div>

                            {/* deltacl - Padding/delta */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-600">
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary-600">deltacl</code>
                                    <span className="ml-2 text-gray-500">Column padding</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={layoutConfig.deltacl}
                                        onChange={(e) => handleLayoutChange('deltacl', e.target.value)}
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none"
                                    />
                                    <span className="text-xs text-gray-400">cm</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 pt-1">
                                These values control the TikZ table layout dimensions.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
