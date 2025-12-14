import mongoose, { Document, Schema } from 'mongoose';
import { IQuizQuestion } from './QuizQuestion';

export interface ILesson extends Document {
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  duration: number; // in minutes
  order: number;
  quiz?: mongoose.Types.ObjectId[] | IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String },
  content: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  order: { type: Number, required: true },
  quiz: [{ type: Schema.Types.ObjectId, ref: 'QuizQuestion' }]
}, { timestamps: true });

const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
export default Lesson;