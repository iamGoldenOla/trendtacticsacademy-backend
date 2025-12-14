# Trendtactics Academy LMS Backend

A comprehensive Learning Management System (LMS) backend built with Node.js, Express, TypeScript, and MongoDB. This API powers the Trendtactics Academy platform with robust features for course management, user authentication, progress tracking, and more.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role management
- **Course Management** - Create, update, and organize courses with lessons
- **Progress Tracking** - Monitor student learning progress and completion
- **Badge System** - Gamification with achievement badges
- **File Upload** - Secure file handling for course materials

### Code Quality & Security
- **TypeScript** - Full type safety and better developer experience
- **ESLint & Prettier** - Consistent code style and quality
- **Comprehensive Testing** - Unit and integration tests with Jest
- **Security Middleware** - Helmet, rate limiting, and CORS protection
- **Error Handling** - Centralized error management with detailed logging
- **API Documentation** - Swagger/OpenAPI documentation
- **Logging** - Winston-based logging for monitoring and debugging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp src/.env.example src/.env
   ```
   
   Configure your environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/lms
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`
- **API Info**: `http://localhost:5000/api`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Development Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check

# Seed database with sample data
npm run seed
```

## 📁 Project Structure

```
src/
├── __tests__/          # Test files
│   ├── setup.ts        # Test configuration
│   └── *.test.ts       # Test suites
├── config/             # Configuration files
│   └── swagger.ts      # API documentation setup
├── controllers/        # Route controllers
│   ├── authController.ts
│   ├── courseController.ts
│   └── ...
├── middleware/         # Express middleware
│   ├── auth.ts         # Authentication middleware
│   └── errorHandler.ts # Error handling
├── models/             # MongoDB models
│   ├── User.ts
│   ├── Course.ts
│   └── ...
├── routes/             # API routes
│   ├── authRoutes.ts
│   ├── courseRoutes.ts
│   └── ...
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── db.ts           # Database connection
│   └── logger.ts       # Logging utility
└── index.ts            # Application entry point
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress
- `GET /api/progress/:courseId` - Get course progress

### Badges
- `GET /api/badges` - Get all badges
- `POST /api/badges` - Create badge
- `GET /api/badges/user/:userId` - Get user badges

### File Upload
- `POST /api/upload` - Upload files

## 🛡️ Security Features

- **Helmet** - Security headers
- **Rate Limiting** - Prevent abuse
- **CORS** - Cross-origin resource sharing
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Mongoose schema validation
- **Error Sanitization** - Prevent information leakage

## 📊 Logging

The application uses Winston for comprehensive logging:
- **Console logs** - Development environment
- **File logs** - Production environment
- **Error logs** - Separate error file
- **HTTP logs** - Request/response logging

Log files are stored in the `logs/` directory.

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGO_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   FRONTEND_URL=your-production-frontend-url
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## 📈 Future Enhancements

- **Calendar Integration** - Schedule assignments and deadlines
- **Bento Layout To-Do List** - Modern task organization
- **Real-time Notifications** - WebSocket integration
- **Advanced Analytics** - Learning progress insights
- **Mobile API** - React Native support

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Course Endpoints

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Create a new course (instructor/admin)
- `PUT /api/courses/:id` - Update a course (instructor/admin)
- `DELETE /api/courses/:id` - Delete a course (instructor/admin)
- `POST /api/courses/:id/enroll` - Enroll in a course (student)
- `GET /api/courses/instructor/courses` - Get instructor courses (instructor)
- `GET /api/courses/student/enrolled` - Get enrolled courses (student)

### Lesson Endpoints

- `GET /api/courses/:courseId/lessons/:lessonId` - Get a lesson
- `POST /api/courses/:courseId/lessons` - Add a lesson (instructor/admin)
- `PUT /api/courses/:courseId/lessons/:lessonId` - Update a lesson (instructor/admin)
- `DELETE /api/courses/:courseId/lessons/:lessonId` - Delete a lesson (instructor/admin)
- `POST /api/courses/:courseId/lessons/:lessonId/complete` - Mark lesson as complete (student)

### Quiz Endpoints

- `GET /api/courses/:courseId/lessons/:lessonId/quiz` - Get lesson quiz
- `POST /api/courses/:courseId/lessons/:lessonId/quiz` - Add quiz to lesson (instructor/admin)
- `PUT /api/courses/:courseId/lessons/:lessonId/quiz` - Update lesson quiz (instructor/admin)
- `POST /api/courses/:courseId/lessons/:lessonId/quiz/submit` - Submit quiz answers (student)
- `GET /api/courses/:courseId/module-quiz` - Get module quiz
- `PUT /api/courses/:courseId/module-quiz` - Update module quiz (instructor/admin)
- `POST /api/courses/:courseId/module-quiz/submit` - Submit module quiz answers (student)

### Progress Endpoints

- `GET /api/progress` - Get all user progress
- `GET /api/progress/:courseId` - Get user progress for a course
- `PUT /api/progress/:courseId/access` - Update last accessed time
- `DELETE /api/progress/:courseId` - Reset progress for a course
- `GET /api/progress/stats/:courseId` - Get course completion stats (instructor/admin)

### Badge Endpoints

- `GET /api/badges` - Get all badges
- `POST /api/badges` - Create a badge (admin)
- `PUT /api/badges/:id` - Update a badge (admin)
- `DELETE /api/badges/:id` - Delete a badge (admin)
- `POST /api/badges/:id/award/:userId` - Award badge to user (admin)
- `GET /api/badges/user/:userId` - Get user badges

### Upload Endpoints

- `POST /api/upload/avatar` - Upload user avatar (protected)
- `POST /api/upload/thumbnail/:courseId` - Upload course thumbnail (instructor/admin)

## License

This project is licensed under the MIT License.