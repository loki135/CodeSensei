import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center max-w-lg">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <Link
              to="/"
              className="px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 