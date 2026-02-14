"""
Sudaksha Assessment - Python Backend
Handles: Voice Interview (AI conversational), Video Analysis, Code Execution
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import voice, video, code

app = FastAPI(
    title="Sudaksha Python API",
    description="Voice, Video, and Code assessment services",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(video.router, prefix="/api/video", tags=["video"])
app.include_router(code.router, prefix="/api/code", tags=["code"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sudaksha-python-api"}
