import { CohereClient } from '@cohere-ai/cohere-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Cohere client with API key
const cohere = new CohereClient({
  token: 'TZYeYpbNB2YUG28oACQGPxZQWKACZKZ8WmNusqss'
});

async function testCohereReview() {
  try {
    console.log('Testing Cohere code review...');
    
    const testCode = `
function calculateTotal(items) {
  let total = 0;
  for(let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
    `;

    console.log('Sending request to Cohere...');
    const response = await cohere.generate({
      model: 'command',
      prompt: `You are an experienced JavaScript code reviewer. Please review this code for potential bugs and issues:\n\n${testCode}\n\nProvide a detailed analysis of potential bugs, issues, and suggested fixes specific to JavaScript.`,
      max_tokens: 2000,
      temperature: 0.3,
      k: 0,
      p: 0.75,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    });

    console.log('\nCohere API Response:', JSON.stringify(response, null, 2));
    console.log('\nReview Results:');
    console.log('---------------');
    console.log(response.generations[0].text);
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
    if (error.status === 401) {
      console.error('Invalid API key. Please check your API key configuration.');
    } else if (error.status === 429) {
      console.error('Rate limit exceeded. Please try again later');
    }
  }
}

// Run the test
testCohereReview(); 