import { CohereClient } from 'cohere-ai';

// Initialize Cohere client with API key
const cohere = new CohereClient({
  token: 'TZYeYpbNB2YUG28oACQGPxZQWKACZKZ8WmNusqss'
});

async function testCohere() {
  try {
    console.log('Testing Cohere API...');
    
    const response = await cohere.generate({
      model: 'command',
      prompt: 'Hello, how are you?',
      max_tokens: 50,
      temperature: 0.3,
      k: 0,
      p: 0.75,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    });

    console.log('\nCohere API Response:', JSON.stringify(response, null, 2));
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
  }
}

// Run the test
testCohere(); 