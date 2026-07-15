import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { courses } from "../../../Trendtactics Academy/trendtactics-academy-1/src/data/mockData";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Generating SQL seed script for quiz questions...");

  // 1. Fetch all lessons from the database to map titles to UUIDs
  const { data: dbLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, title");

  if (lessonsError) {
    console.error("Error fetching lessons from database:", lessonsError);
    process.exit(1);
  }

  console.log(`Fetched ${dbLessons?.length || 0} lessons from database.`);

  let sqlContent = `-- Quiz Questions Seed Script for Trendtactics Academy\n`;
  sqlContent += `-- Generated on ${new Date().toISOString()}\n\n`;
  sqlContent += `BEGIN;\n\n`;
  sqlContent += `-- Clear existing quiz questions\n`;
  sqlContent += `DELETE FROM public.quiz_questions;\n\n`;
  sqlContent += `-- Insert quiz questions\n`;
  sqlContent += `INSERT INTO public.quiz_questions (lesson_id, question, options, correct_answer, explanation) VALUES\n`;

  const valueRows: string[] = [];
  let matchCount = 0;

  for (const course of courses) {
    for (const section of course.sections || []) {
      for (const lecture of section.lectures) {
        if (lecture.type === "quiz" && lecture.quizQuestions) {
          // Match by normalized title
          const dbLesson = dbLessons?.find(
            (dl) =>
              dl.title.trim().toLowerCase() ===
              lecture.title.trim().toLowerCase()
          );

          if (!dbLesson) {
            console.warn(`Could not find lesson "${lecture.title}" in DB.`);
            continue;
          }

          matchCount++;

          lecture.quizQuestions.forEach((q) => {
            // Escape single quotes for SQL insertion
            const cleanQuestion = q.question.replace(/'/g, "''");
            const cleanExplanation = q.explanation.replace(/'/g, "''");
            const optionsJson = JSON.stringify(q.options).replace(/'/g, "''");

            valueRows.push(
              `  ('${dbLesson.id}', '${cleanQuestion}', '${optionsJson}'::jsonb, '${q.correctIndex}', '${cleanExplanation}')`
            );
          });
        }
      }
    }
  }

  sqlContent += valueRows.join(",\n");
  sqlContent += `;\n\nCOMMIT;\n`;

  const outputPath = path.join(__dirname, "seedQuizzes.sql");
  fs.writeFileSync(outputPath, sqlContent, "utf8");

  console.log(`\nMatched ${matchCount} quiz lessons.`);
  console.log(`Generated ${valueRows.length} question rows in SQL.`);
  console.log(`Saved SQL seed script to: ${outputPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error generating SQL:", err);
  process.exit(1);
});
