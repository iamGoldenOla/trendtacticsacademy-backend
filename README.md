# Trendtactics Academy LMS Backend - Supabase Edition

A comprehensive Learning Management System (LMS) backend built with Node.js, Express, TypeScript, and Supabase. This API powers the Trendtactics Academy platform with robust features for course management, user authentication, progress tracking, and more.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - Supabase Auth with role management
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
- Supabase Account
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
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   
   Follow the instructions in [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md) to set up your Supabase database tables and relationships.

5. **Start the development server**
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

# Test Supabase connection
npm run test-supabase

# Test Supabase connection with credentials
npm run test-supabase-credentials

# Check environment variables
npm run check-env

# Test environment variables
npm run test-env-vars
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
├── models/             # Supabase models (replaces MongoDB models)
│   ├── User.ts
│   ├── Course.ts
│   └── ...
├── routes/             # API routes
│   ├── authRoutes.ts
│   ├── courseRoutes.ts
│   └── ...
├── scripts/            # Database scripts and utilities
│   ├── *.sql           # SQL scripts for database setup
│   └── *.ts            # TypeScript utilities
├── services/           # Business logic
│   └── aiService.ts    # AI tutor service
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── supabase.ts     # Supabase client configuration
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
- **Supabase Auth** - Secure token-based auth
- **Input Validation** - Supabase schema validation
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
   PORT=5000
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_ANON_KEY=your_production_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
   JWT_SECRET=your_production_jwt_secret
   JWT_EXPIRE=30d
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Deploy to your preferred platform**
   - Vercel
   - Heroku
   - AWS
   - DigitalOcean
   - Other cloud platforms

## 📚 Documentation

- [Supabase Integration Guide](SUPABASE_INTEGRATION.md)
- [Final Integration Summary](FINAL_INTEGRATION_SUMMARY.md)
- [Security Notice](SECURITY_NOTICE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📞 Contact

For any questions or issues, please contact the development team.