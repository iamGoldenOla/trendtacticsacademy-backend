import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String }
}, { timestamps: true });

const QuizQuestion = mongoose.model<IQuizQuestion>('QuizQuestion', QuizQuestionSchema);
export default QuizQuestion;