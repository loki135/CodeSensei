import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to CodeSensei
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your AI-powered code review assistant
        </p>
        
        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-block px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Register
            </Link>
          </div>
        ) : (
          <Link
            to="/review"
            className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Start Code Review
          </Link>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="w-12 h-12 mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Bug Detection
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Find and fix potential bugs, security issues, and code smells in your codebase.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="w-12 h-12 mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Performance Optimization
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Get suggestions for improving code performance, efficiency, and best practices.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="w-12 h-12 mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Code Readability
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Improve code structure, naming, and documentation for better maintainability.
          </p>
        </div>
      </div>
    </div>
  );
} 