# AI-Powered Career Portal

A comprehensive MERN stack application that provides AI-powered resume analysis, intelligent job matching, and personalized career guidance to help job seekers accelerate their career growth.

## 🚀 Features

### Core Features
- **AI Resume Analysis**: Upload and analyze resumes with detailed feedback and improvement suggestions
- **Smart Job Matching**: Intelligent job recommendations based on skills, experience, and preferences
- **Placement Analytics**: Comprehensive statistics and market insights for informed career decisions
- **Learning Recommendations**: Personalized course and skill suggestions to bridge career gaps

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Profile Management**: Complete user profiles with skills, experience, and preferences
- **Resume Upload**: Support for PDF, DOC, and DOCX file formats
- **Job Search**: Advanced filtering and search capabilities
- **Dashboard**: Personalized dashboard with activity tracking and quick actions

### Admin Features
- **User Management**: Admin panel for managing users and content
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Job Management**: Create and manage job postings
- **System Monitoring**: Track system performance and user engagement

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **Helmet** - Security middleware

### AI & Analytics
- **OpenAI API** - Resume analysis and content generation
- **Hugging Face** - NLP models for text processing
- **Custom ML Models** - Job matching algorithms

## 📁 Project Structure

```
ai-career-portal/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts
│   │   └── lib/              # Utility functions
│   ├── public/               # Static assets
│   └── package.json
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   └── app.js            # Main application file
│   ├── uploads/              # File uploads directory
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-career-portal
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the frontend development server
   npm run dev
   ```

4. **Database Setup**
   - Ensure MongoDB is running locally or update the connection string in `.env`
   - The application will automatically create the necessary collections

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ai-career-portal
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Resume Endpoints
- `POST /api/resumes/upload` - Upload and analyze resume
- `GET /api/resumes` - Get user's resumes
- `GET /api/resumes/:id` - Get specific resume
- `DELETE /api/resumes/:id` - Delete resume

### Job Endpoints
- `GET /api/jobs` - Get all jobs with filtering
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create job posting (Recruiter/Admin)
- `PUT /api/jobs/:id` - Update job posting

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard analytics (Admin)
- `GET /api/analytics/user-stats` - User-specific analytics

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean and professional design
- **Interactive Components**: Smooth animations and transitions
- **Accessibility**: WCAG compliant components
- **Dark Mode**: Support for light and dark themes (coming soon)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Helmet Security**: Security headers with Helmet.js

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the Next.js application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting platform
3. Update API URLs in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Your Name
- **Project Type**: Bachelor's Capstone Project in IT
- **Institution**: Your University

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Tailwind CSS for the design system
- Next.js team for the amazing framework
- MongoDB for the database solution

---

**Note**: This is a capstone project demonstrating modern web development practices with AI integration. The project showcases full-stack development skills using the MERN stack with TypeScript and modern UI/UX design principles.
