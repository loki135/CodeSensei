import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Review from '../models/Review.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Sample reviews data
const sampleReviews = [
  {
    userId: '684322b39861e2da97946628', // Your user ID
    codeSnippet: `function calculateTotal(items) {
  let total = 0;
  for(let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
    language: 'javascript',
    reviewType: 'optimization',
    reviewResult: `Here are some optimization suggestions for your code:

1. Use Array.reduce() instead of a for loop for better readability and performance:
   const total = items.reduce((sum, item) => sum + item.price, 0);

2. Add input validation to handle edge cases:
   if (!Array.isArray(items)) return 0;

3. Consider adding type checking for price values:
   if (typeof item.price !== 'number') {
     console.warn('Invalid price value:', item.price);
     return 0;
   }

4. Add error handling for potential NaN values:
   if (isNaN(total)) return 0;`
  },
  {
    userId: '684322b39861e2da97946628', // Your user ID
    codeSnippet: `async function fetchUserData(userId) {
  const response = await fetch('/api/users/' + userId);
  const data = await response.json();
  return data;
}`,
    language: 'javascript',
    reviewType: 'bug',
    reviewResult: `Here are some potential bugs and security issues in your code:

1. No error handling for failed requests:
   try {
     const response = await fetch('/api/users/' + userId);
     if (!response.ok) throw new Error('Failed to fetch user data');
     const data = await response.json();
     return data;
   } catch (error) {
     console.error('Error fetching user data:', error);
     throw error;
   }

2. No input validation for userId:
   if (!userId || typeof userId !== 'string') {
     throw new Error('Invalid user ID');
   }

3. Potential XSS vulnerability in URL construction:
   const response = await fetch(\`/api/users/\${encodeURIComponent(userId)}\`);

4. No timeout handling:
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 5000);
   try {
     const response = await fetch(url, { signal: controller.signal });
     clearTimeout(timeoutId);
     // ... rest of the code
   } catch (error) {
     clearTimeout(timeoutId);
     throw error;
   }`
  },
  {
    userId: '684322b39861e2da97946628', // Your user ID
    codeSnippet: `class UserService {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  findUser(id) {
    return this.users.find(u => u.id === id);
  }
}`,
    language: 'javascript',
    reviewType: 'readability',
    reviewResult: `Here are some suggestions to improve code readability and maintainability:

1. Add JSDoc comments for better documentation:
   /**
    * Service class for managing users
    * @class UserService
    */
   class UserService {
     /**
      * Creates a new UserService instance
      * @constructor
      */
     constructor() {
       this.users = [];
     }

     /**
      * Adds a new user to the service
      * @param {Object} user - The user object to add
      * @throws {Error} If user is invalid
      */
     addUser(user) {
       if (!user || typeof user !== 'object') {
         throw new Error('Invalid user object');
       }
       this.users.push(user);
     }

     /**
      * Finds a user by their ID
      * @param {string|number} id - The user ID to search for
      * @returns {Object|undefined} The found user or undefined
      */
     findUser(id) {
       return this.users.find(u => u.id === id);
     }
   }

2. Add input validation for better error handling
3. Consider using TypeScript for better type safety
4. Add error handling for edge cases
5. Consider adding methods for updating and deleting users`
  }
];

// Connect to MongoDB and insert sample data
async function seedReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing reviews for the user
    await Review.deleteMany({ userId: '684322b39861e2da97946628' });
    console.log('Cleared existing reviews');

    // Insert sample reviews
    const result = await Review.insertMany(sampleReviews);
    console.log('Successfully inserted sample reviews:', result.length);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
}

// Run the seed function
seedReviews(); 