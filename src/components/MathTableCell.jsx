import { useEffect, useRef, useState } from 'react';

// Import MathLive - this registers the web component
import 'mathlive';

/**
 * MathTableCell component - A compact MathLive wrapper for table cells
 * Optimized for use inside table layouts with minimal styling
 */
export default function MathTableCell({
    value = '',
    onChange,
    placeholder = '',
    className = '',
    disabled = false
}) {
    const mathFieldRef = useRef(null);
    const isInternalChange = useRef(false);
    const [isReady, setIsReady] = useState(false);

    // Wait for the math-field to be ready
    useEffect(() => {
        const mathField = mathFieldRef.current;
        if (!mathField) return;

        const checkReady = () => {
            if (mathField.setValue && typeof mathField.setValue === 'function') {
                setIsReady(true);
                if (value) {
                    try {
                        mathField.setValue(value, { suppressChangeNotifications: true });
                    } catch (e) {
                        console.warn('MathTableCell setValue failed:', e);
                    }
                }
            } else {
                setTimeout(checkReady, 50);
            }
        };

        checkReady();
    }, []);

    // Update the math-field value when prop changes
    useEffect(() => {
        const mathField = mathFieldRef.current;
        if (mathField && isReady && !isInternalChange.current) {
            try {
                if (mathField.getValue && mathField.getValue() !== value) {
                    mathField.setValue(value, { suppressChangeNotifications: true });
                }
            } catch (e) {
                console.warn('MathTableCell update failed:', e);
            }
        }
        isInternalChange.current = false;
    }, [value, isReady]);

    // Set up event listener for changes
    useEffect(() => {
        const mathField = mathFieldRef.current;
        if (!mathField || !isReady) return;

        const handleInput = () => {
            isInternalChange.current = true;
            try {
                const newValue = mathField.getValue ? mathField.getValue() : '';
                if (onChange) {
                    onChange(newValue);
                }
            } catch (e) {
                console.warn('MathTableCell getValue failed:', e);
            }
        };

        mathField.addEventListener('input', handleInput);

        return () => {
            mathField.removeEventListener('input', handleInput);
        };
    }, [onChange, isReady]);

    return (
        <math-field
            ref={mathFieldRef}
            class={`compact ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            placeholder={placeholder}
            virtual-keyboard-mode="off"
            smart-mode="true"
        />
    );
}
