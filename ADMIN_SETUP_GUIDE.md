# Sudaksha NWS Admin Platform Setup Guide

## Overview
The Sudaksha NWS Admin Platform is a comprehensive management system for creating and managing courses, trainers, and batches. It consists of:

1. **Next.js Admin Dashboard** - Frontend interface for internal teams
2. **Python FastAPI AI Service** - Course generation microservice
3. **PostgreSQL Database** - Data storage with Prisma ORM

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod
- **Backend**: Python FastAPI, Pydantic
- **Database**: PostgreSQL with Prisma ORM
- **AI**: LLM integration for course generation

## Setup Instructions

### 1. Database Setup
```bash
# Install dependencies
npm install

# Set up database environment variables in .env
DATABASE_URL="postgresql://username:password@localhost:5432/sudaksha_admin"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npm run db:seed
```

### 2. Python AI Service Setup
```bash
# Navigate to Python service directory
cd python_service

# Install Python dependencies
pip install -r requirements.txt

# Run the AI service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Next.js Admin Dashboard
```bash
# Install additional dependencies
npm install react-hook-form @hookform/resolvers zod --legacy-peer-deps

# Run the development server
npm run dev
```

## Access Points

### Admin Dashboard
- **URL**: http://localhost:3000/admin
- **Login**: Currently open (implement authentication as needed)

### AI Service API
- **Base URL**: http://localhost:8000
- **Course Generation**: POST /generate-course
- **Health Check**: GET /health

## Key Features

### 1. Dashboard Home (`/admin`)
- Real-time statistics (courses, trainers, batches, students)
- Upcoming batches overview
- Quick action cards for common tasks

### 2. Course Creation (`/admin/courses/create`)
- **AI-Powered Generation**: Input topic, industry, audience, and context
- **Live Preview**: See generated course structure in real-time
- **Review & Edit**: Modify AI-generated content before publishing
- **Database Integration**: Save complete course with modules and lessons

### 3. Database Schema
Optimized models with performance indexes:
- **Trainer**: Expert profiles with experience and ratings
- **Course**: Complete course structure with pricing and categories
- **CourseModule**: Modular course organization
- **CourseLesson**: Individual lessons with duration and content
- **CourseBatch**: Scheduled training sessions
- **CourseReview**: Student feedback system

## API Integration

### Course Generation Flow
1. Admin fills course details form
2. Frontend sends POST request to Python service
3. AI generates structured course content
4. Frontend displays preview with editing capabilities
5. Admin publishes course to database via Next.js server actions

### Sample API Request
```json
POST http://localhost:8000/generate-course
{
  "topic": "React Development",
  "industry": "Software",
  "target_audience": "Beginner",
  "context_prompt": "Focus on modern React with hooks and TypeScript"
}
```

## Performance Optimizations

### Database Indexes
- `@@index([category, status])` on Course for filtering
- `@@index([startDate, status])` on CourseBatch for scheduling
- `@@index([trainerId])` on Course and CourseBatch

### Frontend Optimizations
- React Hook Form with Zod validation
- Loading skeletons during AI generation
- Efficient data fetching with server actions

## Security Considerations

### Current Implementation
- Admin section is publicly accessible (needs authentication)
- No API rate limiting on Python service
- Database connections use environment variables

### Recommended Enhancements
- Implement NextAuth.js or similar for admin authentication
- Add API rate limiting and authentication
- Implement role-based access control
- Add audit logging for admin actions

## Development Workflow

### 1. Making Changes
```bash
# Frontend changes
npm run dev

# Python service changes
cd python_service && uvicorn main:app --reload

# Database schema changes
npx prisma migrate dev
```

### 2. Testing
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npx prisma studio
```

## Production Deployment

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Next.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret"

# Python Service
OPENAI_API_KEY="your-openai-key" # If using OpenAI
```

### Docker Setup (Recommended)
```dockerfile
# Dockerfile for Python service
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues
1. **Prisma Client Generation**: Run `npx prisma generate` after schema changes
2. **Python Service Not Responding**: Check if port 8000 is available
3. **TypeScript Errors**: Verify import paths and type definitions
4. **Database Connection**: Ensure PostgreSQL is running and accessible

### Debug Mode
```bash
# Next.js debug
NEXT_DEBUG=1 npm run dev

# Python service debug
uvicorn main:app --reload --log-level debug
```

## Next Steps

### Immediate Enhancements
1. Add authentication system
2. Implement trainer management pages
3. Create batch scheduling interface
4. Add course editing capabilities

### Future Features
1. Advanced analytics dashboard
2. Student management system
3. Certificate generation
4. Email notifications
5. Payment integration

## Support

For issues and questions:
1. Check the console logs for error details
2. Verify database connectivity
3. Ensure Python service is running
4. Review environment variable configuration
