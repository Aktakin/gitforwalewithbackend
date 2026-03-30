/**
 * Writes Stripe-related keys into .env files from environment variables.
 * Never commit real keys. Run in PowerShell:
 *
 *   $env:STRIPE_PUBLISHABLE_KEY="pk_test_..."; $env:STRIPE_SECRET_KEY="sk_test_..."; node setup-stripe.js
 *
 * Or set STRIPE_PUBLISHABLE_KEY / STRIPE_SECRET_KEY in your shell, then: node setup-stripe.js
 */

const fs = require('fs');
const path = require('path');

const STRIPE_PUBLISHABLE_KEY =
  process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_REPLACE_ME';
const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || 'sk_test_REPLACE_ME';

if (STRIPE_PUBLISHABLE_KEY.includes('REPLACE') || STRIPE_SECRET_KEY.includes('REPLACE')) {
  console.log('\nSet keys first, for example (PowerShell):');
  console.log('  $env:STRIPE_PUBLISHABLE_KEY="pk_test_..."');
  console.log('  $env:STRIPE_SECRET_KEY="sk_test_..."');
  console.log('  node setup-stripe.js\n');
  console.log('Or copy .env.example → .env and server/.env.example → server/.env and edit by hand.\n');
}

const rootEnvPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'server', '.env');

let existingEnv = '';
if (fs.existsSync(rootEnvPath)) {
  existingEnv = fs.readFileSync(rootEnvPath, 'utf8');
  console.log('✅ Found existing .env file');
} else {
  console.log('📝 Will create new .env file');
}

const hasStripeKey = existingEnv.includes('REACT_APP_STRIPE_PUBLISHABLE_KEY');
const hasSupabase = existingEnv.includes('REACT_APP_SUPABASE_URL');

let newEnvContent = existingEnv;

if (!hasSupabase) {
  console.log('⚠️  Supabase keys not found. Add REACT_APP_SUPABASE_* to .env if you use auth/data.');
  newEnvContent += '\n# Supabase Configuration\n';
  newEnvContent += 'REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co\n';
  newEnvContent += 'REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here\n';
}

if (hasStripeKey) {
  newEnvContent = newEnvContent.replace(
    /REACT_APP_STRIPE_PUBLISHABLE_KEY=.*/,
    `REACT_APP_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}`
  );
  console.log('✅ Updated REACT_APP_STRIPE_PUBLISHABLE_KEY');
} else {
  newEnvContent += '\n# Stripe Configuration\n';
  newEnvContent += `REACT_APP_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}\n`;
  newEnvContent += 'REACT_APP_PAYMENT_API_URL=http://localhost:3001/api/payments\n';
  console.log('✅ Added Stripe frontend variables');
}

if (!newEnvContent.endsWith('\n')) {
  newEnvContent += '\n';
}

fs.writeFileSync(rootEnvPath, newEnvContent, 'utf8');
console.log('✅ Frontend .env written:', rootEnvPath);

if (!fs.existsSync(path.join(__dirname, 'server'))) {
  fs.mkdirSync(path.join(__dirname, 'server'), { recursive: true });
}

const backendEnvContent = `# Stripe Backend — keep secret; never commit this file
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`;

fs.writeFileSync(backendEnvPath, backendEnvContent, 'utf8');
console.log('✅ Backend .env written:', backendEnvPath);

console.log('\nNext: npm run payment-api   (terminal 1)');
console.log('      npm start             (terminal 2)');
console.log('Test card: 4242 4242 4242 4242\n');
