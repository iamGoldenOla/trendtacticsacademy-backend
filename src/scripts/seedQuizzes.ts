import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { courses } from "../../../Trendtactics Academy/trendtactics-academy-1/src/data/mockData";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const keyToUse = supabaseServiceKey && !supabaseServiceKey.startsWith("your_")
  ? supabaseServiceKey
  : supabaseAnonKey;

if (!supabaseUrl || !keyToUse) {
  console.error("Missing SUPABASE_URL or active API key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, keyToUse);

async function main() {
  console.log("Starting quiz questions seeding...");

  // 1. Fetch all lessons from the database
  const { data: dbLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, title");

  if (lessonsError) {
    console.error("Error fetching lessons from database:", lessonsError);
    process.exit(1);
  }

  console.log(`Fetched ${dbLessons?.length || 0} lessons from database.`);

  // 2. Clear existing quiz questions
  const { error: deleteError } = await supabase
    .from("quiz_questions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows safely

  if (deleteError) {
    console.error("Error clearing quiz_questions table:", deleteError);
    process.exit(1);
  }
  console.log("Cleared existing quiz questions.");

  let insertCount = 0;

  // 3. Match lessons and insert quiz questions
  for (const course of courses) {
    for (const section of course.sections || []) {
      for (const lecture of section.lectures) {
        if (lecture.type === "quiz" && lecture.quizQuestions) {
          // Find matching lesson in database
          // Normalize titles by converting to lowercase and stripping whitespace
          const dbLesson = dbLessons?.find(
            (dl) =>
              dl.title.trim().toLowerCase() ===
              lecture.title.trim().toLowerCase()
          );

          if (!dbLesson) {
            console.warn(
              `Could not find lesson "${lecture.title}" in the database. Skipping quiz.`
            );
            continue;
          }

          console.log(
            `Seeding quiz for: "${lecture.title}" (DB Lesson UUID: ${dbLesson.id})`
          );

          const questionsToInsert = lecture.quizQuestions.map((q) => ({
            lesson_id: dbLesson.id,
            question: q.question,
            options: q.options,
            correct_answer: q.correctIndex.toString(),
            explanation: q.explanation,
          }));

          const { error: insertError } = await supabase
            .from("quiz_questions")
            .insert(questionsToInsert);

          if (insertError) {
            console.error(
              `Error inserting quiz for lesson "${lecture.title}":`,
              insertError
            );
          } else {
            insertCount += questionsToInsert.length;
          }
        }
      }
    }
  }

  console.log(`\nSuccessfully seeded ${insertCount} quiz questions!`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal seeding error:", err);
  process.exit(1);
});
