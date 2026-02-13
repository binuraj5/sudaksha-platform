# Sudaksha AI Course Generator

Python FastAPI microservice for generating course content using AI.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /generate-course
Generate a complete course structure.

**Request:**
```json
{
  "topic": "React Development",
  "industry": "Software",
  "target_audience": "Beginner",
  "context_prompt": "Focus on modern React with hooks"
}
```

**Response:** Complete course structure matching Prisma schema.

### GET /health
Health check endpoint.

## Integration

The Next.js admin dashboard calls this service to generate course content, which is then reviewed and saved to the database.
