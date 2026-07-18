import React from "react";
import PropTypes from "prop-types";

/**
 * ErrorBoundary Component
 * - Catches runtime errors in child components
 * - Displays a fallback UI
 * - Optionally allows retry (reset)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    // You can also log this to an error tracking service like Sentry
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Optionally call a prop reset handler
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      // If a custom fallback is provided, render it
      if (fallback) return fallback;

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Something went wrong 
          </h2>
          <p className="text-gray-700 mb-4">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          {/* <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
          >
            Try Again
          </button> */}
        </div>
      );
    }

    // No error — render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  onReset: PropTypes.func,
};

export default ErrorBoundary;
