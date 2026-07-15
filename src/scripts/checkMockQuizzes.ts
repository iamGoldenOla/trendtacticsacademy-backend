import { courses } from "../../../Trendtactics Academy/trendtactics-academy-1/src/data/mockData";

console.log("Extracting quizzes from mockData...");
let count = 0;
courses.forEach(course => {
  course.sections?.forEach(section => {
    section.lectures.forEach(lecture => {
      if (lecture.type === "quiz") {
        count++;
        console.log(`\n[Course: ${course.title}] -> [Lesson: ${lecture.title}]`);
        console.log(`Questions: ${lecture.quizQuestions?.length || 0}`);
        console.log(JSON.stringify(lecture.quizQuestions, null, 2));
      }
    });
  });
});
console.log(`\nTotal quiz lessons found: ${count}`);
