import { useState } from 'react';
import { toast } from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import ReviewTypeSelector from '../components/ReviewTypeSelector';
import { reviewAPI } from '../utils/api';

export default function Review() {
  const [code, setCode] = useState('');
  const [reviewType, setReviewType] = useState('bug');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('');

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review');
      return;
    }

    console.log('Starting code review with:', {
      reviewType,
      language,
      codeLength: code.length
    });

    setIsLoading(true);
    setSuggestions('');

    try {
      const response = await reviewAPI.submitCode({
        code,
        type: reviewType,
        language,
      });

      console.log('Received review response:', response);

      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
        toast.success('Code review completed!');
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Failed to get review');
      }
    } catch (error: any) {
      console.error('Review error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error(error.message || 'Failed to review code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Code Review
      </h1>
      
      <div className="grid gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Review Settings
          </h2>
          <ReviewTypeSelector selected={reviewType} onChange={setReviewType} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Your Code
          </h2>
          <CodeEditor 
            onCodeChange={setCode} 
            onLanguageChange={setLanguage}
            initialCode=""
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleReview}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Review Code'
            )}
          </button>
        </div>

        {suggestions && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Suggestions
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                {suggestions}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 