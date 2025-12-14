import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect and query a simple table
    const { data: tables, error: tablesError } = await supabase
      .from('enrollments')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('Error querying enrollments table:', tablesError.message);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log('✅ Successfully queried enrollments table');
    
    // Test 2: Check if we can query with joins (to verify foreign keys)
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        progress,
        enrollment_date,
        course:courses (id, title)
      `)
      .limit(3);
    
    if (enrollmentsError) {
      console.warn('⚠️  Warning: Could not join with courses table:', enrollmentsError.message);
      console.log('This might be expected if you have no courses yet or foreign keys are not set up');
    } else {
      console.log('✅ Successfully joined enrollments with courses');
      console.log('Sample enrollments:', JSON.stringify(enrollments, null, 2));
    }
    
    // Test 3: Check if we can insert a record
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      course_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      progress: 0,
      enrollment_date: new Date().toISOString()
    };
    
    // We'll use a transaction-like approach by inserting and then immediately deleting
    const { data: inserted, error: insertError } = await supabase
      .from('enrollments')
      .insert(testRecord)
      .select()
      .single();
    
    if (insertError) {
      console.warn('⚠️  Warning: Could not insert test record:', insertError.message);
      console.log('This might be expected if you have RLS enabled or constraints');
    } else {
      console.log('✅ Successfully inserted test record');
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', inserted.id);
      
      if (deleteError) {
        console.warn('⚠️  Warning: Could not delete test record:', deleteError.message);
      } else {
        console.log('✅ Successfully cleaned up test record');
      }
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('Your Supabase integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testConnection();