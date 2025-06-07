import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Review {
  _id: string;
  code: string;
  language: string;
  type: string;
  review: string;
  createdAt: string;
}

export default function History() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('History component mounted, user:', user);
    if (user) {
      fetchReviews();
    } else {
      console.log('No user found, not fetching reviews');
      setIsLoading(false);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching reviews with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('History response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received reviews:', data);
      setReviews(data.data);
    } catch (error) {
      console.error('History fetch error:', error);
      toast.error('Failed to load review history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Review History
      </h1>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No review history found. Start by reviewing some code!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div key="header" className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-300">
                    {review.type}
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:text-green-300">
                    {review.language}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div key="content" className="space-y-4">
                <div key={`code-section-${review._id}`}>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Code
                  </h3>
                  <pre className="bg-gray-50 dark:bg-gray-900 rounded p-4 overflow-x-auto text-sm">
                    {review.code}
                  </pre>
                </div>

                <div key={`suggestions-section-${review._id}`}>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Review
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {review.review}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 