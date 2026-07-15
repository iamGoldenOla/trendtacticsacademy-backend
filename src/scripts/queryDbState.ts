import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== DATABASE STATE ===");

  // 1. SELECT id, title, slug, price, status FROM courses;
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, slug, price, status');
  
  if (coursesError) {
    console.error("Error fetching courses:", coursesError.message);
  } else {
    console.log("courses data:");
    console.log(JSON.stringify(courses, null, 2));
  }

  // 2. SELECT COUNT(*) FROM modules;
  const { count: modulesCount, error: modulesError } = await supabase
    .from('modules')
    .select('*', { count: 'exact', head: true });

  if (modulesError) {
    console.error("Error counting modules:", modulesError.message);
  } else {
    console.log("modules count:", modulesCount);
  }

  // 3. SELECT COUNT(*) FROM lessons;
  const { count: lessonsCount, error: lessonsError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  if (lessonsError) {
    console.error("Error counting lessons:", lessonsError.message);
  } else {
    console.log("lessons count:", lessonsCount);
  }
}

run().catch(console.error);
