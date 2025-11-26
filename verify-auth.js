/**
 * Authentication Setup Verification Script
 * 
 * Run this to check if your Supabase credentials are properly configured
 * 
 * Usage:
 *   node verify-auth.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Authentication Setup...\n');

// Check Web App .env
console.log('📱 WEB APP CONFIGURATION:');
console.log('─'.repeat(50));

const webEnvPath = path.join(__dirname, '.env');
const webEnvExists = fs.existsSync(webEnvPath);

if (!webEnvExists) {
  console.log('❌ .env file NOT FOUND in root directory');
  console.log('   Create it with:');
  console.log('   REACT_APP_SUPABASE_URL=your-url');
  console.log('   REACT_APP_SUPABASE_ANON_KEY=your-key\n');
} else {
  console.log('✅ .env file exists');
  
  const webUrl = process.env.REACT_APP_SUPABASE_URL;
  const webKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (!webUrl || webUrl === 'https://your-project.supabase.co') {
    console.log('❌ REACT_APP_SUPABASE_URL not configured');
  } else {
    console.log(`✅ REACT_APP_SUPABASE_URL: ${webUrl}`);
  }
  
  if (!webKey || webKey === 'your-anon-key') {
    console.log('❌ REACT_APP_SUPABASE_ANON_KEY not configured');
  } else {
    console.log(`✅ REACT_APP_SUPABASE_ANON_KEY: ${webKey.substring(0, 20)}...`);
  }
  console.log();
}

// Check Mobile App .env
console.log('📱 MOBILE APP CONFIGURATION:');
console.log('─'.repeat(50));

const mobileEnvPath = path.join(__dirname, 'SkillBApp', '.env');
const mobileEnvExists = fs.existsSync(mobileEnvPath);

if (!mobileEnvExists) {
  console.log('❌ .env file NOT FOUND in SkillBApp directory');
  console.log('   Create it with:');
  console.log('   EXPO_PUBLIC_SUPABASE_URL=your-url');
  console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key\n');
} else {
  console.log('✅ .env file exists');
  
  // Read mobile .env file manually since it uses different prefix
  const mobileEnvContent = fs.readFileSync(mobileEnvPath, 'utf8');
  const mobileUrlMatch = mobileEnvContent.match(/EXPO_PUBLIC_SUPABASE_URL=(.+)/);
  const mobileKeyMatch = mobileEnvContent.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  
  const mobileUrl = mobileUrlMatch ? mobileUrlMatch[1].trim() : null;
  const mobileKey = mobileKeyMatch ? mobileKeyMatch[1].trim() : null;
  
  if (!mobileUrl || mobileUrl === 'https://your-project.supabase.co') {
    console.log('❌ EXPO_PUBLIC_SUPABASE_URL not configured');
  } else {
    console.log(`✅ EXPO_PUBLIC_SUPABASE_URL: ${mobileUrl}`);
  }
  
  if (!mobileKey || mobileKey === 'your-anon-key') {
    console.log('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY not configured');
  } else {
    console.log(`✅ EXPO_PUBLIC_SUPABASE_ANON_KEY: ${mobileKey.substring(0, 20)}...`);
  }
  console.log();
  
  // Check if credentials match
  if (webEnvExists && mobileEnvExists) {
    console.log('🔗 CREDENTIAL COMPARISON:');
    console.log('─'.repeat(50));
    
    const webUrl = process.env.REACT_APP_SUPABASE_URL;
    const mobileEnvContent = fs.readFileSync(mobileEnvPath, 'utf8');
    const mobileUrlMatch = mobileEnvContent.match(/EXPO_PUBLIC_SUPABASE_URL=(.+)/);
    const mobileUrl = mobileUrlMatch ? mobileUrlMatch[1].trim() : null;
    
    if (webUrl && mobileUrl && webUrl === mobileUrl) {
      console.log('✅ Both apps use the SAME Supabase URL');
      console.log('   Authentication will be linked! 🎉\n');
    } else {
      console.log('❌ Apps use DIFFERENT Supabase URLs');
      console.log('   Web:    ' + (webUrl || 'NOT SET'));
      console.log('   Mobile: ' + (mobileUrl || 'NOT SET'));
      console.log('   ⚠️  Authentication will NOT be linked!\n');
      console.log('   👉 Fix: Update both .env files to use the SAME URL\n');
    }
  }
}

// Summary
console.log('📋 SUMMARY:');
console.log('─'.repeat(50));

if (!webEnvExists && !mobileEnvExists) {
  console.log('❌ Both .env files are missing');
  console.log('\n👉 Next Steps:');
  console.log('   1. Get your Supabase credentials from https://app.supabase.com');
  console.log('   2. Create .env file in root directory (web app)');
  console.log('   3. Create .env file in SkillBApp directory (mobile app)');
  console.log('   4. Use the SAME credentials in both files');
  console.log('   5. Restart both apps\n');
} else if (!webEnvExists) {
  console.log('❌ Web app .env file is missing');
  console.log('\n👉 Next Step: Create .env file in root directory\n');
} else if (!mobileEnvExists) {
  console.log('❌ Mobile app .env file is missing');
  console.log('\n👉 Next Step: Create .env file in SkillBApp directory\n');
} else {
  console.log('✅ Both .env files exist');
  console.log('\n👉 Next Steps:');
  console.log('   1. Make sure credentials are properly configured (not placeholders)');
  console.log('   2. Verify both apps use the SAME Supabase URL and key');
  console.log('   3. Restart both apps');
  console.log('   4. Test login on both platforms\n');
}

console.log('📚 For detailed setup instructions, see:');
console.log('   - CHECK_AUTH_SETUP.md');
console.log('   - QUICK_DATABASE_SETUP.md');
console.log('   - LINK_WEB_AND_MOBILE_DATABASE.md\n');

