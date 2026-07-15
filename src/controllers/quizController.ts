import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

/**
 * @desc    Get quiz for a lesson
 * @route   GET /api/courses/:courseId/lessons/:lessonId/quiz
 * @access  Private
 */
export const getLessonQuiz = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = (req as any).user.id;

    // Verify enrollment
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollError) throw enrollError;
    if (!enrollment && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Fetch quiz questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId);

    if (questionsError) throw questionsError;
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No quiz found for this lesson' });
    }

    const mapped = questions.map((q: any) => ({
      _id: q.id,
      id: q.id,
      question: q.question,
      options: q.options || [],
      correctIndex: parseInt(q.correct_answer || '0', 10),
      explanation: q.explanation || ''
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Get lesson quiz error:', error);
    res.status(500).json({ message: 'Server error fetching lesson quiz' });
  }
};

/**
 * @desc    Add quiz to lesson
 * @route   POST /api/courses/:courseId/lessons/:lessonId/quiz
 * @access  Private/Instructor
 */
export const addQuizToLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const quizQuestions = req.body.questions;

    if (!quizQuestions || !Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      return res.status(400).json({ message: 'Please provide quiz questions' });
    }

    const toInsert = quizQuestions.map((q: any) => ({
      lesson_id: lessonId,
      question: q.question,
      options: q.options,
      correct_answer: (q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer).toString(),
      explanation: q.explanation || ''
    }));

    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert(toInsert)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Add quiz error:', error);
    res.status(500).json({ message: 'Server error adding quiz' });
  }
};

/**
 * @desc    Update quiz for a lesson
 * @route   PUT /api/courses/:courseId/lessons/:lessonId/quiz
 * @access  Private/Instructor
 */
export const updateLessonQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const quizQuestions = req.body.questions;

    if (!quizQuestions || !Array.isArray(quizQuestions)) {
      return res.status(400).json({ message: 'Please provide quiz questions' });
    }

    // Delete existing
    const { error: deleteError } = await supabaseAdmin
      .from('quiz_questions')
      .delete()
      .eq('lesson_id', lessonId);

    if (deleteError) throw deleteError;

    // Insert new
    if (quizQuestions.length > 0) {
      const toInsert = quizQuestions.map((q: any) => ({
        lesson_id: lessonId,
        question: q.question,
        options: q.options,
        correct_answer: (q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer).toString(),
        explanation: q.explanation || ''
      }));

      const { data, error } = await supabaseAdmin
        .from('quiz_questions')
        .insert(toInsert)
        .select();

      if (error) throw error;
      return res.json(data);
    }

    res.json([]);
  } catch (error: any) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error updating quiz' });
  }
};

/**
 * @desc    Submit quiz answers
 * @route   POST /api/courses/:courseId/lessons/:lessonId/quiz/submit
 * @access  Private
 */
export const submitQuizAnswers = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = (req as any).user.id;
    let answers = req.body.answers;

    // Handle dictionary format of answers { questionId: selectedIndex }
    if (answers && !Array.isArray(answers) && typeof answers === 'object') {
      answers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption: Number(selectedOption)
      }));
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Please provide answers' });
    }

    // 1. Verify enrollment
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollError) throw enrollError;
    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // 2. Fetch quiz questions
    const { data: dbQuestions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId);

    if (questionsError) throw questionsError;
    if (!dbQuestions || dbQuestions.length === 0) {
      return res.status(404).json({ message: 'No quiz found for this lesson' });
    }

    // 3. Grade the quiz
    const results = answers.map((ans: any) => {
      const question = dbQuestions.find((q: any) => q.id === ans.questionId);
      if (!question) {
        return {
          questionId: ans.questionId,
          correct: false,
          message: 'Question not found'
        };
      }
      
      const correctOption = parseInt(question.correct_answer || '0', 10);
      const isCorrect = correctOption === ans.selectedOption;
      
      return {
        questionId: question.id,
        question: question.question,
        correct: isCorrect,
        selectedOption: ans.selectedOption,
        correctOption: isCorrect ? undefined : correctOption,
        explanation: question.explanation
      };
    });

    const totalQuestions = dbQuestions.length;
    const correctAnswers = results.filter((r: any) => r.correct).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passing = score >= 70;

    // 4. Record the attempt in quiz_attempts
    const { error: attemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        score: score,
        passed: passing,
        answers: answers
      });

    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError);
    }

    // 5. If passed, mark lesson completed
    if (passing) {
      const completedLessons = enrollment.completed_lessons || [];
      if (!completedLessons.includes(lessonId)) {
        const updatedCompleted = [...completedLessons, lessonId];
        
        const { data: lessons } = await supabaseAdmin
          .from('lessons')
          .select('id, module:modules!inner(course_id)')
          .eq('modules.course_id', courseId);
        
        const totalLessonsCount = lessons ? lessons.length : 1;
        const progressPercentage = Math.min(
          Math.round((updatedCompleted.length / totalLessonsCount) * 100),
          100
        );

        await supabaseAdmin
          .from('enrollments')
          .update({
            completed_lessons: updatedCompleted,
            progress: progressPercentage,
            last_accessed: new Date().toISOString()
          })
          .eq('id', enrollment.id);
      }
    }

    res.json({
      score,
      totalQuestions,
      correctAnswers,
      passing,
      results
    });
  } catch (error: any) {
    console.error('Submit quiz answers error:', error);
    res.status(500).json({ message: 'Server error submitting quiz answers' });
  }
};

/**
 * @desc    Get module quiz
 */
export const getModuleQuiz = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Module quiz not implemented' });
};

/**
 * @desc    Add or update module quiz
 */
export const updateModuleQuiz = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Module quiz not implemented' });
};

/**
 * @desc    Submit module quiz answers
 */
export const submitModuleQuizAnswers = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Module quiz not implemented' });
};