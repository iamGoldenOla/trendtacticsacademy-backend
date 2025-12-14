import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Base interfaces
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  instructor: Types.ObjectId | IUser;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: number; // in hours
  thumbnail?: string;
  tags: string[];
  lessons: Types.ObjectId[] | ILesson[];
  enrolledStudents: Types.ObjectId[] | IUser[];
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  content: string;
  course: Types.ObjectId | ICourse;
  order: number;
  duration: number; // in minutes
  videoUrl?: string;
  attachments: string[];
  isPreview: boolean;
  quiz?: Types.ObjectId | IQuizQuestion;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourse;
  lesson: Types.ObjectId | ILesson;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizQuestion extends Document {
  _id: Types.ObjectId;
  lesson: Types.ObjectId | ILesson;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBadge extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'course_completion' | 'quiz_score' | 'streak' | 'custom';
    value: number;
    courseId?: Types.ObjectId;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request interfaces
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: number;
  tags: string[];
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  isPublished?: boolean;
}

export interface CreateLessonRequest {
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  videoUrl?: string;
  isPreview?: boolean;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

export interface CreateQuizRequest {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {}

// Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

// Utility types
export type UserRole = 'student' | 'instructor' | 'admin';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type BadgeCriteriaType = 'course_completion' | 'quiz_score' | 'streak' | 'custom';

// Query interfaces
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CourseQuery extends PaginationQuery {
  category?: string;
  level?: CourseLevel;
  instructor?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string;
}

export interface UserQuery extends PaginationQuery {
  role?: UserRole;
  isActive?: string;
  search?: string;
}

// File upload interfaces
export interface FileUploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Database connection interface
export interface DatabaseConfig {
  uri: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    family?: number;
  };
}

// Environment variables interface
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  EMAIL_FROM: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: string;
}