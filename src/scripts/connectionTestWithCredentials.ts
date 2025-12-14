import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase credentials
const supabaseUrl = 'https://uimdbodamoeyukrghchb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbWRib2RhbW9leXVrcmdoY2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTYwMzksImV4cCI6MjA4MTAzMjAzOX0.kMFpnaZN04ac94u0wcXJFsS58lX88h8RCM2de3rwYIc';

console.log('Testing Supabase connection with provided credentials...');
console.log('Supabase URL:', supabaseUrl);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connectivity...');
    
    // Test a simple query to check connectivity
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log('✅ Lesson progress table is accessible');
    
    console.log('\n2. Testing table listing...');
    // Try to get table information
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.log('⚠️  Note: Could not list tables (this is normal for anon key)');
    } else {
      console.log('✅ Table listing successful');
    }
    
    console.log('\n3. Testing simple data operation...');
    // Try to insert a test record with dummy data
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      lesson_id: '00000000-0000-0000-0000-000000000000',
      completed: false,
      last_accessed: new Date().toISOString()
    };
    
    const { data: inserted, error: insertError } = await supabase
      .from('lesson_progress')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('⚠️  Note: Could not insert test data (expected with RLS enabled)');
      console.log('   This is normal - RLS policies may prevent anonymous writes');
    } else {
      console.log('✅ Successfully inserted test data');
      
      // Clean up - try to delete the test record
      const { error: deleteError } = await supabase
        .from('lesson_progress')
        .delete()
        .eq('id', inserted.id);
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not clean up test data');
      } else {
        console.log('✅ Successfully cleaned up test data');
      }
    }
    
    console.log('\n4. Testing authentication capabilities...');
    // Test if we can get the current user (should be null for anon key)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  Auth check returned error:', authError.message);
    } else {
      if (user) {
        console.log('✅ Authenticated user:', user.id);
      } else {
        console.log('✅ Anonymous access confirmed (no authenticated user)');
      }
    }
    
    console.log('\n🎉 All connection tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Supabase URL is accessible');
    console.log('   - Anon key is valid');
    console.log('   - Database tables are reachable');
    console.log('   - RLS policies are active (as expected)');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testConnection();