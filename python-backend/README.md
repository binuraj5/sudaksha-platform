# Sudaksha Python Backend

FastAPI service for Voice Interview, Video Analysis, and Code Execution.

## Setup

```bash
cd python-backend
pip install -r requirements.txt
```

## Environment

Create `.env` in project root or python-backend:

```
OPENAI_API_KEY=sk-...
PYTHON_API_URL=http://localhost:8000  # For Next.js to call this
```

## Run

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Or
python run.py
```

## Docker

```bash
# From project root
docker-compose up fastapi
```

## Endpoints

### Voice Interview
- `POST /api/voice/transcribe` - Transcribe audio (Whisper)
- `POST /api/voice/start-interview` - Start AI interview session
- `POST /api/voice/respond` - Process response, get follow-up
- `POST /api/voice/evaluate` - Evaluate full transcript

### Video (placeholder)
- `POST /api/video/analyze` - 501 until implemented

### Code
- `POST /api/code/execute` - Run code with test cases (Piston API)
