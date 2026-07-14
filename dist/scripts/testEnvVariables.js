"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config({ path: '.env' });
console.log('Testing Environment Variables...\n');
// Check Supabase environment variables
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ?
    `${process.env.SUPABASE_ANON_KEY.substring(0, 10)}...${process.env.SUPABASE_ANON_KEY.slice(-10)}` :
    'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ?
    `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-10)}` :
    'Not set');
// Verify the values are correct
if (process.env.SUPABASE_URL === 'https://uimdbodamoeyukrghchb.supabase.co') {
    console.log('✅ SUPABASE_URL is correctly set');
}
else {
    console.log('❌ SUPABASE_URL is not set correctly');
}
if (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
    console.log('✅ SUPABASE_ANON_KEY is correctly set');
}
else {
    console.log('❌ SUPABASE_ANON_KEY is not set correctly');
}
console.log('\n🎉 Environment variables test completed!');
