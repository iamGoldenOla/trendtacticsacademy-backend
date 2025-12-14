import mongoose, { Document, Schema } from 'mongoose';
import { ILesson } from './Lesson';
import { IQuizQuestion } from './QuizQuestion';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  thumbnail: string;
  price: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  lessons: mongoose.Types.ObjectId[] | ILesson[];
  enrolledStudents: mongoose.Types.ObjectId[]; // Changed from number to array of ObjectIds
  rating: number;
  topics: string[];
  moduleQuiz?: mongoose.Types.ObjectId[] | IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner',
    required: true 
  },
  category: { type: String, required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Changed from Number to array of ObjectIds
  rating: { type: Number, default: 0 },
  topics: [{ type: String }],
  moduleQuiz: [{ type: Schema.Types.ObjectId, ref: 'QuizQuestion' }]
}, { timestamps: true });

const Course = mongoose.model<ICourse>('Course', CourseSchema);
export default Course;