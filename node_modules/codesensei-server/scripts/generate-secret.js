const crypto = require('crypto');

// Generate a secure random string
const secret = crypto.randomBytes(64).toString('hex');

console.log('\nGenerated JWT Secret:');
console.log('=====================');
console.log(secret);
console.log('\nAdd this to your .env file as:');
console.log('JWT_SECRET=' + secret);
console.log('\nOr set it in your Railway environment variables.'); 