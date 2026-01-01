/**
 * LaTeX Generator for tkz-tab package
 * Generates valid LaTeX code for variation and sign tables
 */

/**
 * Escape special LaTeX characters in a string
 */
export function escapeLatex(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}]/g, '\\$&')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Convert common math symbols to LaTeX
 */
export function toLatexSymbol(value) {
    if (!value) return '';

    // If already LaTeX formatted, return as-is
    if (value.includes('\\')) return value;

    // Common symbol conversions
    const conversions = {
        '∞': '\\infty',
        '+∞': '+\\infty',
        '-∞': '-\\infty',
        'π': '\\pi',
        '√': '\\sqrt',
        '≤': '\\leq',
        '≥': '\\geq',
        '≠': '\\neq',
        '±': '\\pm',
        '×': '\\times',
        '÷': '\\div',
        'α': '\\alpha',
        'β': '\\beta',
        'γ': '\\gamma',
        'δ': '\\delta',
        'θ': '\\theta',
        'λ': '\\lambda',
        'μ': '\\mu',
        'σ': '\\sigma',
        'φ': '\\phi',
        'ω': '\\omega',
    };

    let result = value;
    for (const [symbol, latex] of Object.entries(conversions)) {
        // Escape special regex characters in the symbol
        const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escapedSymbol, 'g'), latex);
    }

    return result;
}

/**
 * Wrap a value in math mode if needed
 */
export function wrapMath(value) {
    if (!value) return '$~$';
    const latex = toLatexSymbol(value);
    return `$${latex}$`;
}

/**
 * Generate the \tkzTabInit command
 * @param {string} variable - The variable name (e.g., 'x')
 * @param {string} functionName - The function name (e.g., 'f(x)')
 * @param {string[]} points - Array of key points
 * @param {boolean} includeSign - Whether to include a sign row
 * @param {boolean} includeVariation - Whether to include a variation row
 * @param {Object} layoutConfig - Layout configuration {lgt, espcl, deltacl}
 */
export function generateTabInit(variable, functionName, points, includeSign = true, includeVariation = true, expressions = [], variationFunctionName = null, layoutConfig = null) {
    const varLatex = toLatexSymbol(variable) || 'x';
    const funcLatex = toLatexSymbol(functionName) || 'f(x)';
    const varFuncLatex = toLatexSymbol(variationFunctionName) || funcLatex;

    // Build the column definitions
    const columns = [];
    columns.push(`$${varLatex}$ / 1`);

    // Add row for each expression (sign rows)
    if (includeSign) {
        if (expressions.length > 0) {
            expressions.forEach(expr => {
                const exprLatex = toLatexSymbol(expr.name) || 'f(x)';
                columns.push(`$${exprLatex}$ / 1`);
            });
        } else {
            columns.push(`$${funcLatex}$ / 1`);
        }
    }

    if (includeVariation) {
        columns.push(`$${varFuncLatex}$ / 1.5`);
    }

    // Build the points list
    const pointsList = points.map(p => wrapMath(p)).join(', ');

    // Build optional layout parameters
    let optionalParams = '';
    if (layoutConfig) {
        const { lgt = 2, espcl = 2, deltacl = 0.5 } = layoutConfig;
        optionalParams = `[lgt=${lgt},espcl=${espcl},deltacl=${deltacl}]`;
    }

    return `\\tkzTabInit${optionalParams}{${columns.join(' , ')}}{${pointsList}}`;
}

/**
 * Generate the \\tkzTabLine command for signs
 * @param {string[]} signs - Array of interval signs ('+', '-') for each interval
 * @param {string[]} pointTypes - Array of point values for ALL points ('z', 'd', 't', 'n')
 * Sign/value meanings:
 * - '+': positive (interval)
 * - '-': negative (interval)
 * - 'z': zero (at a point - function = 0)
 * - 'd': double bar (undefined/discontinuity)
 * - 't': forbidden value (vertical asymptote, dashed)
 * - 'n': no line (empty)
 */
export function generateTabLine(signs, pointTypes = []) {
    if (!signs || signs.length === 0) return '';

    // tkz-tab expects format: {at_point0, interval0, at_point1, interval1, ..., at_pointN}
    // For n intervals, we have n+1 points

    const parts = [];

    for (let i = 0; i < signs.length; i++) {
        // At point i (before interval i)
        const pointType = pointTypes[i] || 'n';
        // 'n' means no line, so we use empty string
        parts.push(pointType === 'n' ? '' : pointType);

        // Interval sign - 'h' means hatched/forbidden zone
        parts.push(signs[i]);
    }

    // Last point
    const lastPointType = pointTypes[signs.length] || 'n';
    parts.push(lastPointType === 'n' ? '' : lastPointType);

    return `\\tkzTabLine{${parts.join(', ')}}`;
}

/**
 * Generate the \tkzTabVar command for variations
 * @param {Object[]} variations - Array of variation objects
 * Each variation: { direction: 'up' | 'down', value: string, isExtreme: boolean }
 */
export function generateTabVar(variations) {
    if (!variations || variations.length === 0) return '';

    const parts = [];

    for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        const value = v.value ? `$${toLatexSymbol(v.value)}$` : '';

        if (i === 0) {
            // First point
            if (v.direction === 'up') {
                parts.push(`-/ ${value}`);
            } else {
                parts.push(`+/ ${value}`);
            }
        } else if (i === variations.length - 1) {
            // Last point
            if (v.direction === 'up') {
                parts.push(`+/ ${value}`);
            } else {
                parts.push(`-/ ${value}`);
            }
        } else {
            // Middle points
            if (v.isLocalMax) {
                parts.push(`+/ ${value}`);
            } else if (v.isLocalMin) {
                parts.push(`-/ ${value}`);
            } else if (v.direction === 'up') {
                parts.push(`+/ ${value}`);
            } else {
                parts.push(`-/ ${value}`);
            }
        }
    }

    return `\\tkzTabVar{${parts.join(', ')}}`;
}

/**
 * Generate a simpler variation row based on arrows
 * @param {string[]} arrows - Array of arrow directions ('up', 'down')
 * @param {string[]} values - Array of values at each point
 */
export function generateSimpleTabVar(arrows, values, pointTypes = [], leftValues = []) {
    if (!arrows || arrows.length === 0) return '';

    const parts = [];
    const n = arrows.length; // number of intervals = number of arrows

    // tkz-tab variation syntax:
    // +/ or -/ : value at top or bottom
    // +H/ or -H/ : value FOLLOWED by a forbidden zone (hatched)
    // R/ : skip this antecedent (arrow continues through) - used inside forbidden zones
    // +D-/ val1 / val2 : double bar with left/right values

    for (let i = 0; i <= n; i++) {
        const val = values[i] ? `$${toLatexSymbol(values[i])}$` : '';
        const leftVal = leftValues[i] ? `$${toLatexSymbol(leftValues[i])}$` : val;

        const prevArrow = i > 0 ? arrows[i - 1] : null;
        const currArrow = i < n ? arrows[i] : null;

        // Determine position based on arrows
        // prevArrow: arrow coming INTO this point
        // currArrow: arrow going OUT of this point
        let inPos = '-'; // position based on incoming arrow
        let outPos = '-'; // position based on outgoing arrow

        if (prevArrow === 'up') inPos = '+';
        else if (prevArrow === 'down') inPos = '-';
        else if (prevArrow === 'h') inPos = '-'; // default for hatched

        if (currArrow === 'up') outPos = '-';
        else if (currArrow === 'down') outPos = '+';
        else if (currArrow === 'h') outPos = '-'; // default for hatched

        // Handle double bar points
        if (pointTypes[i] === 'd') {
            if (i === 0) {
                // First point with double bar
                parts.push(`D${outPos}/ ${val}`);
            } else if (i === n) {
                // Last point with double bar
                parts.push(`${inPos}D/ ${leftVal}`);
            } else {
                // Middle point with double bar
                parts.push(`${inPos}D${outPos}/ ${leftVal} / ${val}`);
            }
        }
        // Handle hatched zone transitions
        else if (currArrow === 'h' && prevArrow !== 'h') {
            // ENTERING hatched zone - use H to start forbidden zone after this point
            const pos = prevArrow === 'up' ? '+' : (prevArrow === 'down' ? '-' : outPos);
            parts.push(`${pos}H/ ${val}`);
        }
        else if (prevArrow === 'h' && currArrow === 'h') {
            // INSIDE hatched zone - skip this point with R
            parts.push(`R/`);
        }
        else if (prevArrow === 'h' && currArrow !== 'h') {
            // EXITING hatched zone - end with regular position
            const pos = currArrow === 'up' ? '-' : (currArrow === 'down' ? '+' : inPos);
            parts.push(`${pos}/ ${val}`);
        }
        // First point (no previous arrow)
        else if (i === 0) {
            parts.push(`${outPos}/ ${val}`);
        }
        // Last point (no next arrow)
        else if (i === n) {
            parts.push(`${inPos}/ ${val}`);
        }
        // Middle points
        else {
            // Determine position based on local max/min
            let pos = '';
            if (prevArrow === 'up' && currArrow === 'down') pos = '+'; // local max
            else if (prevArrow === 'down' && currArrow === 'up') pos = '-'; // local min
            else if (currArrow === 'up') pos = '-';
            else pos = '+';
            parts.push(`${pos}/ ${val}`);
        }
    }

    return `\\tkzTabVar{${parts.join(', ')}}`;
}

/**
 * Generate the preamble for a standalone LaTeX document
 */
export function generatePreamble() {
    return `\\documentclass[border=5pt]{standalone}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{tikz}
\\usetikzlibrary{patterns}
\\usepackage{tkz-tab}
\\tikzset{h style/.style={pattern=north west lines}}`;
}

/**
 * Generate the complete LaTeX document
 * @param {Object} tableData - The table configuration
 */
export function generateFullDocument(tableData) {
    const {
        variable = 'x',
        functionName = 'f(x)',
        points = ['-\\infty', '0', '+\\infty'],
        signs = [],
        pointSigns = [],
        arrows = [],
        values = [],
        expressions = [],
        tableType = 'both', // 'sign', 'variation', or 'both'
        variationFunctionName = null,
        layoutConfig = { lgt: 2, espcl: 2, deltacl: 0.5 }
    } = tableData;

    const includeSign = tableType === 'sign' || tableType === 'both';
    const includeVariation = tableType === 'variation' || tableType === 'both';

    let body = '';

    // Generate TabInit with expressions and layout config
    body += generateTabInit(variable, functionName, points, includeSign, includeVariation, expressions, variationFunctionName, layoutConfig);
    body += '\n';

    // Generate TabLine for each expression (or single signs if no expressions)
    if (includeSign) {
        if (expressions.length > 0) {
            expressions.forEach(expr => {
                if (expr.signs && expr.signs.length > 0) {
                    body += generateTabLine(expr.signs, expr.pointTypes);
                    body += '\n';
                }
            });
        } else if (signs.length > 0) {
            body += generateTabLine(signs, pointSigns);
            body += '\n';
        }
    }

    // Generate TabVar for variations
    if (includeVariation && arrows.length > 0) {
        body += generateSimpleTabVar(arrows, values, tableData.variationPointTypes, tableData.variationLeftValues || []);
        body += '\n';
    }

    const preamble = generatePreamble();

    return `${preamble}

\\begin{document}
\\begin{tikzpicture}
${body}\\end{tikzpicture}
\\end{document}`;
}

/**
 * Generate just the TikZ environment (no document wrapper)
 * Useful for embedding in existing documents
 */
export function generateTikzSnippet(tableData) {
    const {
        variable = 'x',
        functionName = 'f(x)',
        points = ['-\\infty', '0', '+\\infty'],
        signs = [],
        pointSigns = [],
        arrows = [],
        values = [],
        tableType = 'both'
    } = tableData;

    const includeSign = tableType === 'sign' || tableType === 'both';
    const includeVariation = tableType === 'variation' || tableType === 'both';

    let body = '';

    body += generateTabInit(variable, functionName, points, includeSign, includeVariation);
    body += '\n';

    if (includeSign && signs.length > 0) {
        body += generateTabLine(signs, pointSigns);
        body += '\n';
    }

    if (includeVariation && arrows.length > 0) {
        body += generateSimpleTabVar(arrows, values, tableData.variationPointTypes, tableData.variationLeftValues || []);
        body += '\n';
    }

    return `\\begin{tikzpicture}
${body}\\end{tikzpicture}`;
}

/**
 * Generate LaTeX code for QuickLaTeX API
 * This needs a slightly different format
 */
export function generateForQuickLatex(tableData) {
    const doc = generateFullDocument(tableData);
    return doc;
}
