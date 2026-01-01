import { useEffect, useRef, useState } from 'react';

// Import MathLive - this registers the web component
import 'mathlive';

/**
 * MathInput component - A wrapper around MathLive's math-field
 * Provides a clean API for LaTeX math input
 */
export default function MathInput({
    value = '',
    onChange,
    placeholder = '',
    className = '',
    disabled = false,
    size = 'md'
}) {
    const mathFieldRef = useRef(null);
    const isInternalChange = useRef(false);
    const [isReady, setIsReady] = useState(false);

    // Size classes
    const sizeClasses = {
        sm: 'text-sm min-h-[36px]',
        md: 'text-base min-h-[42px]',
        lg: 'text-lg min-h-[48px]',
    };

    // Wait for the math-field to be ready
    useEffect(() => {
        const mathField = mathFieldRef.current;
        if (!mathField) return;

        // Check if the math-field is ready (has setValue method)
        const checkReady = () => {
            if (mathField.setValue && typeof mathField.setValue === 'function') {
                setIsReady(true);
                // Set initial value
                if (value) {
                    try {
                        mathField.setValue(value, { suppressChangeNotifications: true });
                    } catch (e) {
                        console.warn('MathField setValue failed:', e);
                    }
                }
            } else {
                // Retry after a short delay
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
                console.warn('MathField update failed:', e);
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
                console.warn('MathField getValue failed:', e);
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
            class={`${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            placeholder={placeholder}
            virtual-keyboard-mode="off"
            smart-mode="true"
        />
    );
}
