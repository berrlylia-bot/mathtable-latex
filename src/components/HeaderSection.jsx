import MathInput from './MathInput';

/**
 * HeaderSection component
 * Input fields for the variable and function names
 */
export default function HeaderSection({
    variable,
    onVariableChange,
    functionName,
    onFunctionChange
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="label">
                    Variable
                    <span className="text-academic-muted font-normal ml-2">(e.g., x, t)</span>
                </label>
                <MathInput
                    value={variable}
                    onChange={onVariableChange}
                    placeholder="x"
                />
            </div>

            <div>
                <label className="label">
                    Function
                    <span className="text-academic-muted font-normal ml-2">(e.g., f(x), g'(x))</span>
                </label>
                <MathInput
                    value={functionName}
                    onChange={onFunctionChange}
                    placeholder="f(x)"
                />
            </div>
        </div>
    );
}
