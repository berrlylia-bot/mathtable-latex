import { useState, useEffect, useMemo } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import VisualTableEditor from './VisualTableEditor';
import PreviewPanel from './PreviewPanel';

// Default configurations for each table type
const DEFAULT_CONFIGS = {
    // Sign table example: x, (x-1), x(x-1) with zeros at 0 and 1
    sign: {
        variable: 't',
        points: ['-\\infty', '-1', '4', '+\\infty'],
        arrows: ['up', 'down', 'up'],
        values: ['', '', '', ''],
        variationLeftValues: ['', '', '', ''],
        variationPointTypes: ['n', 'n', 'n', 'n'],
        variationFunctionName: 'f(t)',
        expressions: [
            {
                name: '(t+1)',
                signs: ['-', '+', '+'],
                pointTypes: ['n', 'z', 't', 'n']
            },
            {
                name: '(t-4)',
                signs: ['-', '-', '+'],
                pointTypes: ['n', 't', 'z', 'n']
            },
            {
                name: '(t+1)(t-4)',
                signs: ['+', '-', '+'],
                pointTypes: ['n', 'z', 'z', 'n']
            }
        ],
        layoutConfig: { lgt: 2.5, espcl: 2, deltacl: 0.5 }
    },
    // Variation table example: f(x) with double bar at 0
    variation: {
        variable: 'x',
        points: ['-\\infty', '0', '1', '+\\infty'],
        arrows: ['up', 'down', 'up'],
        values: ['-\\infty', '+\\infty', '1', '+\\infty'],
        variationLeftValues: ['', '+\\infty', '', ''],
        variationPointTypes: ['n', 'd', 'n', 'n'],
        variationFunctionName: 'f(x)',
        expressions: [
            {
                name: 'f(x)',
                signs: ['+', '-', '+'],
                pointTypes: ['n', 'n', 'n', 'n']
            }
        ],
        layoutConfig: { lgt: 2.5, espcl: 2, deltacl: 0.5 }
    },
    // Both table example: f'(x) sign + f(x) variation with double bar at x=1
    both: {
        variable: 'x',
        points: ['-\\infty', '\\frac{1}{2}', '1', '\\frac{3}{2}', '+\\infty'],
        arrows: ['up', 'down', 'down', 'up'],
        values: ['-\\infty', '1', '+\\infty', '3', '+\\infty'],
        variationLeftValues: ['', '', '-\\infty', '', ''],
        variationPointTypes: ['n', 'n', 'd', 'n', 'n'],
        variationFunctionName: 'f(x)',
        expressions: [
            {
                name: "f'(x)",
                signs: ['+', '-', '-', '+'],
                pointTypes: ['n', 'z', 'd', 'z', 'n']
            }
        ],
        layoutConfig: { lgt: 2.5, espcl: 2, deltacl: 0.5 }
    }
};

/**
 * TableGenerator component
 * Main component with side-by-side visual table editor and preview
 * Each table type (sign, variation, both) has independent state
 */
export default function TableGenerator({ tableType, onTableDataChange, onImageRendered, onRenderingChange, refreshTriggerRef }) {
    // Store separate configurations for each table type
    const [configs, setConfigs] = useState(() => ({
        sign: { ...DEFAULT_CONFIGS.sign },
        variation: { ...DEFAULT_CONFIGS.variation },
        both: { ...DEFAULT_CONFIGS.both }
    }));

    const [showLayoutConfig, setShowLayoutConfig] = useState(false);

    // Get current config based on table type
    const currentConfig = configs[tableType] || configs.sign;

    // Helper to update current table type's config
    const updateConfig = (updates) => {
        setConfigs(prev => ({
            ...prev,
            [tableType]: {
                ...prev[tableType],
                ...updates
            }
        }));
    };

    // Getters for current config
    const variable = currentConfig.variable;
    const points = currentConfig.points;
    const arrows = currentConfig.arrows;
    const values = currentConfig.values;
    const variationLeftValues = currentConfig.variationLeftValues;
    const variationPointTypes = currentConfig.variationPointTypes;
    const variationFunctionName = currentConfig.variationFunctionName;
    const expressions = currentConfig.expressions;
    const layoutConfig = currentConfig.layoutConfig;

    // Setters that update the current table type's config
    const setVariable = (v) => updateConfig({ variable: v });
    const setPoints = (p) => updateConfig({ points: p });
    const setArrows = (a) => updateConfig({ arrows: a });
    const setValues = (v) => updateConfig({ values: v });
    const setVariationLeftValues = (v) => updateConfig({ variationLeftValues: v });
    const setVariationPointTypes = (v) => updateConfig({ variationPointTypes: v });
    const setVariationFunctionName = (v) => updateConfig({ variationFunctionName: v });
    const setExpressions = (e) => updateConfig({ expressions: e });
    const setLayoutConfig = (l) => updateConfig({ layoutConfig: l });

    // Build table data object for generators
    const tableData = useMemo(() => ({
        variable,
        functionName: expressions[0]?.name || 'f(x)',
        points,
        signs: expressions[0]?.signs || [],
        pointSigns: expressions[0]?.pointTypes?.slice(1, -1) || [],
        arrows,
        values,
        variationLeftValues,
        variationPointTypes,
        variationFunctionName,
        expressions,
        tableType,
        layoutConfig,
    }), [variable, points, arrows, values, variationLeftValues, variationPointTypes, variationFunctionName, expressions, tableType, layoutConfig]);

    // Notify parent of table data changes
    useEffect(() => {
        if (onTableDataChange) {
            onTableDataChange(tableData);
        }
    }, [tableData, onTableDataChange]);

    // Handle layout config change
    const handleLayoutChange = (key, value) => {
        const numValue = parseFloat(value) || 0;
        setLayoutConfig({
            ...layoutConfig,
            [key]: numValue
        });
    };

    // Handle points change - adjust expression arrays
    const handlePointsChange = (newPoints) => {
        const newIntervalCount = Math.max(0, newPoints.length - 1);

        // Adjust arrows
        const newArrows = [...arrows];
        while (newArrows.length < newIntervalCount) newArrows.push('up');
        while (newArrows.length > newIntervalCount) newArrows.pop();

        // Adjust values (right values for double bar)
        const newValues = [...values];
        while (newValues.length < newPoints.length) newValues.push('');
        while (newValues.length > newPoints.length) newValues.pop();

        // Adjust left values (for double bar points)
        const newLeftValues = [...variationLeftValues];
        while (newLeftValues.length < newPoints.length) newLeftValues.push('');
        while (newLeftValues.length > newPoints.length) newLeftValues.pop();

        // Adjust variation point types
        const newVariationTypes = [...variationPointTypes];
        while (newVariationTypes.length < newPoints.length) newVariationTypes.push('n');
        while (newVariationTypes.length > newPoints.length) newVariationTypes.pop();

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

        // Update all at once
        updateConfig({
            points: newPoints,
            arrows: newArrows,
            values: newValues,
            variationLeftValues: newLeftValues,
            variationPointTypes: newVariationTypes,
            expressions: newExpressions
        });
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
