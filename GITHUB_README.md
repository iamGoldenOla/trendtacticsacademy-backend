# Trendtactics Academy LMS Backend

This repository contains the backend for the Trendtactics Academy Learning Management System, integrated with Supabase as the primary database.

## 🚀 Features

- **Supabase Integration**: Fully migrated from MongoDB to Supabase
- **User Authentication**: Secure JWT-based authentication with Supabase Auth
- **Course Management**: Complete course, module, and lesson management system
- **Progress Tracking**: Detailed progress tracking for students
- **Gamification**: Badge and achievement system
- **AI-Powered Learning**: Integrated AI tutor and personalized recommendations
- **Real-time Notifications**: Instant notifications and alerts

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Features**: Custom AI tutor implementation
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/     # Custom middleware
├── models/         # Data models (Supabase integration)
├── routes/         # API route definitions
├── scripts/        # Database scripts and utilities
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/iamGoldenOla/trendtacticsacademy.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The project uses the following Supabase tables:

- `users` - User profiles and authentication data
- `courses` - Course information and metadata
- `modules` - Course modules linked to courses
- `lessons` - Individual lessons linked to modules
- `enrollments` - User course enrollments and progress tracking
- `lesson_progress` - Detailed progress tracking for individual lessons
- `certificates` - Course completion certificates
- `quiz_questions` - Assessment questions linked to lessons
- `quiz_attempts` - User quiz attempt records
- `badges` - Achievement badges
- `user_badges` - User badge awards

## 🔐 Security Notice

For security reasons, never commit actual Supabase keys to the repository. Always use environment variables and rotate keys regularly.

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