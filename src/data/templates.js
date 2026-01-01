/**
 * Predefined table templates
 * Each template contains the complete configuration for a table
 */

export const templates = [
    {
        id: 'variation-hatched',
        name: 'Variation with Forbidden Zone',
        description: 'Variation table with a hatched forbidden zone in the middle',
        tableType: 'variation',
        variable: 'x',
        points: ['-\\infty', '-2', '0', '+\\infty'],
        arrows: ['down', 'h', 'up'],
        values: ['+\\infty', '0', '0', '+\\infty'],
        variationLeftValues: ['', '', '', ''],
        variationPointTypes: ['n', 'n', 'n', 'n'],
        expressions: [
            {
                name: 'f(x)',
                signs: ['+', '+', '+'],
                pointTypes: ['n', 'n', 'n', 'n']
            }
        ]
    },
    {
        id: 'sign-hatched-multi',
        name: 'Sign Table with Hatched Zone',
        description: 'Sign table with multiple rows and hatched intervals',
        tableType: 'sign',
        variable: 'x',
        points: ['-\\infty', '-2', '-1', '0', '+\\infty'],
        arrows: ['up', 'up', 'up', 'up'],
        values: ['', '', '', '', ''],
        variationLeftValues: ['', '', '', '', ''],
        variationPointTypes: ['n', 'n', 'n', 'n', 'n'],
        expressions: [
            {
                name: 'x+1',
                signs: ['-', '-', '+', '+'],
                pointTypes: ['n', 'n', 'z', 'n', 'n']
            },
            {
                name: "f'(x)",
                signs: ['-', 'h', 'h', '+'],
                pointTypes: ['n', 'n', 'n', 'n', 'n']
            }
        ]
    },
    {
        id: 'both-double-bar',
        name: 'Sign & Variation with Asymptote',
        description: 'Combined table with vertical asymptote (double bar)',
        tableType: 'both',
        variable: 'x',
        points: ['-\\infty', '\\frac{1}{2}', '1', '\\frac{3}{2}', '+\\infty'],
        arrows: ['up', 'down', 'down', 'up'],
        values: ['-\\infty', '1', '-\\infty', '+\\infty', '3', '+\\infty'],
        variationLeftValues: ['', '', '-\\infty', '+\\infty', '', ''],
        variationPointTypes: ['n', 'n', 'd', 'n', 'n'],
        expressions: [
            {
                name: "f'(x)",
                signs: ['+', '-', '-', '+'],
                pointTypes: ['n', 'z', 'd', 'z', 'n']
            }
        ]
    },
    {
        id: 'sign-multi-row-double-bar',
        name: 'Sign Table with Multiple Rows',
        description: 'Complex sign table with 3 expression rows and double bar',
        tableType: 'sign',
        variable: 'x',
        points: ['-\\infty', '0', '1', '+\\infty'],
        arrows: ['up', 'up', 'up'],
        values: ['', '', '', ''],
        variationLeftValues: ['', '', '', ''],
        variationPointTypes: ['n', 'n', 'n', 'n'],
        expressions: [
            {
                name: 'g(x)',
                signs: ['-', '-', '+'],
                pointTypes: ['n', 'n', 'z', 'n']
            },
            {
                name: 'x^3',
                signs: ['-', '+', '+'],
                pointTypes: ['n', 'z', 'n', 'n']
            },
            {
                name: "f'(x)",
                signs: ['+', '-', '+'],
                pointTypes: ['n', 'd', 'z', 'n']
            }
        ]
    },
    {
        id: 'variation-double-bar',
        name: 'Variation with Asymptote',
        description: 'Variation table with vertical asymptote (double bar)',
        tableType: 'variation',
        variable: 'x',
        points: ['-\\infty', '0', '1', '+\\infty'],
        arrows: ['up', 'down', 'up'],
        values: ['-\\infty', '+\\infty', '+\\infty', '1', '+\\infty'],
        variationLeftValues: ['', '+\\infty', '+\\infty', '', ''],
        variationPointTypes: ['n', 'd', 'n', 'n'],
        expressions: [
            {
                name: 'f(x)',
                signs: ['+', '+', '+'],
                pointTypes: ['n', 'n', 'n', 'n']
            }
        ]
    }
];

export default templates;
