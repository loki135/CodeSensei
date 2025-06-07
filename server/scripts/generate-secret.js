import crypto from 'crypto';

// Generate a secure random string
const secret = crypto.randomBytes(32).toString('hex');

console.log('\nGenerated JWT Secret:');
console.log('---------------------');
console.log(secret);
console.log('\nAdd this to your .env file as JWT_SECRET'); 