import { supabaseAdmin } from '../utils/supabase';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from project root .env
dotenv.config({ path: '.env' });

const courseIds = [
  '8465492d-9477-4b72-875f-2c3f8f117c49', // AI
  'bc2d4420-7988-4389-91ee-325b3069cf72', // ML
  'e0970a25-e51c-43df-9e26-bc94c34d115d', // GenAI
  '5d7a0491-b3b3-4613-888e-73130d22abf2', // DataScience
  '133f925b-381a-464a-a22c-7389c90f5c9e'  // WebDev
];

async function main() {
  console.log("Reading microsoftCoursesData.json...");
  const jsonPath = path.join(__dirname, 'microsoftCoursesData.json');
  const coursesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log("Connecting to Supabase...");
  
  console.log("Clearing old records...");
  // Clear lessons first (child table)
  // Fetch module IDs for our courses to delete their lessons
  const { data: modules, error: fetchModulesError } = await supabaseAdmin
    .from('modules')
    .select('id')
    .in('course_id', courseIds);

  if (fetchModulesError) {
    console.error('Error fetching modules for clearing:', fetchModulesError.message);
  } else if (modules && modules.length > 0) {
    const moduleIds = modules.map(m => m.id);
    const { error: deleteLessonsError } = await supabaseAdmin
      .from('lessons')
      .delete()
      .in('module_id', moduleIds);

    if (deleteLessonsError) {
      console.error('Error deleting lessons:', deleteLessonsError.message);
    } else {
      console.log(`Deleted existing lessons for ${moduleIds.length} modules.`);
    }
  }

  // Clear modules
  const { error: deleteModulesError } = await supabaseAdmin
    .from('modules')
    .delete()
    .in('course_id', courseIds);

  if (deleteModulesError) {
    console.error('Error deleting modules:', deleteModulesError.message);
  } else {
    console.log('Deleted existing modules.');
  }

  // Clear courses
  const { error: deleteCoursesError } = await supabaseAdmin
    .from('courses')
    .delete()
    .in('id', courseIds);

  if (deleteCoursesError) {
    console.error('Error deleting courses:', deleteCoursesError.message);
  } else {
    console.log('Deleted existing courses.');
  }

  console.log("Seeding courses...");

  for (const course of coursesData) {
    console.log(`Seeding course: ${course.title} (${course.id})`);
    
    const levelLower = course.level.toLowerCase();
    const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error: insertCourseError } = await supabaseAdmin
      .from('courses')
      .insert({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        price: course.price,
        duration: course.duration,
        level: levelLower,
        category: course.category,
        rating: course.rating,
        slug: slug,
        status: 'published'
      });

    if (insertCourseError) {
      console.error(`Failed to insert course ${course.title}:`, insertCourseError.message);
      continue;
    }

    // Seed modules (sections)
    if (course.sections) {
      for (let mIdx = 0; mIdx < course.sections.length; mIdx++) {
        const section = course.sections[mIdx];
        console.log(`  Seeding module: ${section.title} (${section.id})`);

        const { error: insertModuleError } = await supabaseAdmin
          .from('modules')
          .insert({
            id: section.id,
            course_id: course.id,
            title: section.title,
            description: `Lessons for ${section.title}`,
            order_index: mIdx + 1
          });

        if (insertModuleError) {
          console.error(`Failed to insert module ${section.title}:`, insertModuleError.message);
          continue;
        }

        // Seed lessons (lectures)
        if (section.lectures) {
          const lessonsToInsert = section.lectures.map((lecture: any, lIdx: number) => ({
            id: lecture.id,
            module_id: section.id,
            title: lecture.title,
            description: `Lesson text and tasks for ${lecture.title}`,
            content: lecture.body,
            video_url: null,
            duration: lecture.duration,
            order_index: lIdx + 1,
            is_preview: false,
            resources: null,
            type: lecture.type
          }));

          const { error: insertLessonsError } = await supabaseAdmin
            .from('lessons')
            .insert(lessonsToInsert);

          if (insertLessonsError) {
            console.error(`Failed to insert lessons for module ${section.title}:`, insertLessonsError.message);
          }
        }
      }
    }
  }

  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
});
