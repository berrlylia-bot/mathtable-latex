import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary component to catch React errors
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                    <h2 className="text-lg font-semibold text-red-700 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-red-600 mb-4">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                    {this.props.showDetails && this.state.errorInfo && (
                        <details className="mt-4 text-left">
                            <summary className="text-sm text-red-600 cursor-pointer">
                                Error Details
                            </summary>
                            <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
