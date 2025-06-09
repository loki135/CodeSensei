import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import type { AxiosResponse } from 'axios';

interface Review {
  _id: string;
  code: string;
  language: string;
  type: string;
  review: string;
  createdAt: string;
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: Review[];
  message?: string;
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
      console.log('Fetching reviews...');
      const response: AxiosResponse<ApiResponse> = await api.get('/history');
      console.log('History response:', response.data);
      console.log('Response status:', response.data.status);
      console.log('Response data:', response.data.data);
      
      // Check if response has the expected structure
      if (!response.data || typeof response.data.status === 'undefined') {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }

      if (response.data.status === 'success') {
        // Ensure we have an array, even if empty
        const reviewsData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('Setting reviews to:', reviewsData);
        setReviews(reviewsData);
        
        if (reviewsData.length === 0) {
          console.log('No reviews found');
        }
      } else {
        console.error('Error status in response:', response.data);
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }
    } catch (error: any) {
      console.error('History fetch error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Only show error toast for actual errors
      if (error.message && !error.message.includes('No reviews found')) {
        toast.error(error.message || 'Failed to load review history');
      }
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
              <div className="flex justify-between items-start mb-4">
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

              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Code
                  </h3>
                  <pre className="bg-gray-50 dark:bg-gray-900 rounded p-4 overflow-x-auto text-sm">
                    {review.code}
                  </pre>
                </div>

                <div>
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