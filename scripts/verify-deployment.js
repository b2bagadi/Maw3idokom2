#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to Vercel to catch common issues
 */

console.log('🔍 Running pre-deployment checks...\n');

const fs = require('fs');
const path = require('path');

let hasErrors = false;

// Check 1: Verify all translation files have required keys
console.log('✓ Checking translation files...');
const translationKeys = ['appointments', 'admin', 'business', 'booking'];
const languages = ['en', 'fr', 'ar'];

languages.forEach(lang => {
    const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        translationKeys.forEach(key => {
            if (!content[key]) {
                console.error(`  ❌ Missing "${key}" section in ${lang}.json`);
                hasErrors = true;
            }
        });
    } catch (error) {
        console.error(`  ❌ Error reading ${lang}.json:`, error.message);
        hasErrors = true;
    }
});

// Check 2: Verify no duplicate routes
console.log('✓ Checking for duplicate routes...');
const adminAppointmentsPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'admin', 'appointments', 'page.tsx');
if (fs.existsSync(adminAppointmentsPath)) {
    console.error('  ❌ Duplicate route found: /admin/appointments/page.tsx should be removed');
    hasErrors = true;
}

// Check 3: Verify API routes exist
console.log('✓ Checking critical API routes...');
const criticalRoutes = [
    'src/app/api/admin/appointments/route.ts',
    'src/app/api/admin/businesses/route.ts',
    'src/app/api/contact/route.ts',
    'src/app/api/appointments/revenue/route.ts',
];

criticalRoutes.forEach(route => {
    const routePath = path.join(__dirname, '..', route);
    if (!fs.existsSync(routePath)) {
        console.error(`  ❌ Missing critical route: ${route}`);
        hasErrors = true;
    }
});

// Check 4: Verify environment variables template exists
console.log('✓ Checking environment setup...');
const envExample = path.join(__dirname, '..', '.env.example');
if (!fs.existsSync(envExample)) {
    console.warn('  ⚠️  No .env.example file found. Consider creating one for deployment reference.');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('❌ Pre-deployment checks FAILED');
    console.error('Please fix the errors above before deploying.');
    process.exit(1);
} else {
    console.log('✅ All pre-deployment checks PASSED');
    console.log('Ready to deploy to Vercel!');
    process.exit(0);
}
