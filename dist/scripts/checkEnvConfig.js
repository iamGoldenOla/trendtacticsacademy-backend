"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
// Load environment variables
dotenv_1.default.config({ path: '.env' });
console.log('🔍 Checking Environment Configuration...\n');
// Check if environment variables are set
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
    console.log('\n📝 Please add these to your .env file\n');
}
else {
    console.log('✅ All required environment variables are present');
    console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL}`);
    if (process.env.SUPABASE_ANON_KEY) {
        console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY.substring(0, 10)}...${process.env.SUPABASE_ANON_KEY.slice(-10)}`);
    }
}
// Also check the hardcoded credentials we were given
const hardcodedUrl = 'https://uimdbodamoeyukrghchb.supabase.co';
const hardcodedAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbWRib2RhbW9leXVrcmdoY2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTYwMzksImV4cCI6MjA4MTAzMjAzOX0.kMFpnaZN04ac94u0wcXJFsS58lX88h8RCM2de3rwYIc';
console.log('\n🔍 Testing Hardcoded Credentials...\n');
if (hardcodedUrl && hardcodedAnonKey) {
    console.log('✅ Hardcoded credentials found');
    console.log(`   URL: ${hardcodedUrl}`);
    console.log(`   ANON KEY: ${hardcodedAnonKey.substring(0, 10)}...${hardcodedAnonKey.slice(-10)}`);
    // Test connection with hardcoded credentials
    console.log('\n🔌 Testing connection with hardcoded credentials...');
    const supabase = (0, supabase_js_1.createClient)(hardcodedUrl, hardcodedAnonKey);
    supabase.from('lesson_progress').select('id').limit(1)
        .then(({ data, error }) => {
        if (error) {
            console.log('❌ Connection failed:', error.message);
        }
        else {
            console.log('✅ Connection successful!');
            console.log('   Lesson progress table is accessible');
        }
        console.log('\n📋 Configuration Check Complete');
        if (missingEnvVars.length === 0) {
            console.log('✅ Your application should be ready to connect to Supabase');
        }
        else {
            console.log('⚠️  Please update your .env file with the correct Supabase credentials');
            console.log('   You can use the values you provided as a starting point');
        }
    });
}
else {
    console.log('❌ Hardcoded credentials not found or incomplete');
}
