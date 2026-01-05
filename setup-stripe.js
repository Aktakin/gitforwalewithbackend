/**
 * Stripe Setup Script
 * 
 * This script helps you configure your Stripe keys.
 * Run: node setup-stripe.js
 */

const fs = require('fs');
const path = require('path');

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SkSEvGKPkzXCzxqFvApki5JZ3CjeER1yb5ljjTZTkUgA96KT0PSIVRDJKdjLzseNs3EnUtXJgWG9DHkihnKxc7U003GRglZie';
const STRIPE_SECRET_KEY = 'sk_test_your_secret_key_here';

const rootEnvPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'server', '.env');

// Read existing .env file if it exists
let existingEnv = '';
if (fs.existsSync(rootEnvPath)) {
  existingEnv = fs.readFileSync(rootEnvPath, 'utf8');
  console.log('✅ Found existing .env file');
} else {
  console.log('📝 Creating new .env file');
}

// Check if Stripe keys are already configured
const hasStripeKey = existingEnv.includes('REACT_APP_STRIPE_PUBLISHABLE_KEY');
const hasSupabase = existingEnv.includes('REACT_APP_SUPABASE_URL');

// Build new .env content
let newEnvContent = existingEnv;

// Add Supabase config if not present (keep existing if present)
if (!hasSupabase) {
  console.log('⚠️  Supabase keys not found. You may need to add them manually.');
  newEnvContent += '\n# Supabase Configuration\n';
  newEnvContent += 'REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co\n';
  newEnvContent += 'REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here\n';
}

// Add or update Stripe keys
if (hasStripeKey) {
  // Replace existing Stripe key
  newEnvContent = newEnvContent.replace(
    /REACT_APP_STRIPE_PUBLISHABLE_KEY=.*/,
    `REACT_APP_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}`
  );
  console.log('✅ Updated existing Stripe publishable key');
} else {
  // Add new Stripe keys
  newEnvContent += '\n# Stripe Configuration\n';
  newEnvContent += `REACT_APP_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}\n`;
  newEnvContent += 'REACT_APP_PAYMENT_API_URL=http://localhost:3001/api/payments\n';
  console.log('✅ Added Stripe publishable key');
}

// Ensure there's a newline at the end
if (!newEnvContent.endsWith('\n')) {
  newEnvContent += '\n';
}

// Write .env file
fs.writeFileSync(rootEnvPath, newEnvContent, 'utf8');
console.log('✅ Frontend .env file configured');

// Create backend .env file
const backendEnvContent = `# Stripe Backend Configuration
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`;

// Create server directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'server'))) {
  fs.mkdirSync(path.join(__dirname, 'server'), { recursive: true });
}

fs.writeFileSync(backendEnvPath, backendEnvContent, 'utf8');
console.log('✅ Backend .env file configured');

console.log('\n🎉 Stripe configuration complete!');
console.log('\n📋 Next steps:');
console.log('1. If you haven\'t already, add your Supabase keys to .env');
console.log('2. Install backend dependencies: npm install express stripe cors dotenv');
console.log('3. Start backend server: npm run payment-api');
console.log('4. Restart frontend: npm start');
console.log('\n✅ Your Stripe test keys are now configured!');

