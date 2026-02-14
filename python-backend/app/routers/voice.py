"""
Voice Interview API - AI-powered conversational assessment
- Transcribe audio (Whisper)
- AI interviewer: TTS questions, follow-ups based on answer quality
- Evaluation: Content, Communication, Confidence, Professionalism
"""
import os
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from openai import OpenAI

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class TranscribeResponse(BaseModel):
    text: str
    transcript: str


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio file using Whisper API."""
    if not client.api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    try:
        contents = await audio.read()
        # Whisper expects a file-like object
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        try:
            with open(tmp_path, "rb") as f:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                )
            text = transcript.text if hasattr(transcript, "text") else str(transcript)
            return TranscribeResponse(text=text, transcript=text)
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class StartInterviewRequest(BaseModel):
    competency_name: str
    target_level: str
    question_count: int = 5


class StartInterviewResponse(BaseModel):
    session_id: str
    initial_question: str
    question_number: int = 1


@router.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(req: StartInterviewRequest):
    """Start a new AI voice interview session. Returns first question."""
    if not client.api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    import uuid
    session_id = str(uuid.uuid4())
    prompt = f"""Generate the first interview question for a {req.target_level}-level assessment of "{req.competency_name}".
The question should be behavioral/situational (e.g., "Tell me about a time when...").
Return ONLY the question text, no preamble."""
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    question = completion.choices[0].message.content.strip()
    return StartInterviewResponse(
        session_id=session_id,
        initial_question=question,
        question_number=1,
    )


class RespondRequest(BaseModel):
    session_id: str
    question: str
    transcript: str
    question_number: int


class RespondResponse(BaseModel):
    follow_up_question: Optional[str] = None
    is_complete: bool
    next_question_number: int
    feedback: Optional[str] = None


@router.post("/respond", response_model=RespondResponse)
async def process_response(req: RespondRequest):
    """Process candidate response and return follow-up or signal completion."""
    if not client.api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    max_questions = 5
    if req.question_number >= max_questions:
        return RespondResponse(
            follow_up_question=None,
            is_complete=True,
            next_question_number=req.question_number,
        )
    prompt = f"""You are an expert interviewer. The candidate was asked: "{req.question}"
Their response: "{req.transcript}"

Analyze the response:
- If it's vague or lacks specifics: Generate ONE follow-up probe (e.g., "Can you be more specific about...")
- If it's detailed and strong: Generate a NEW question on a different aspect of the same competency
- Keep questions concise and professional

Return JSON: {{"follow_up": "question text", "feedback": "brief internal note"}}"""
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    import json
    try:
        data = json.loads(completion.choices[0].message.content)
        follow_up = data.get("follow_up", "")
    except json.JSONDecodeError:
        follow_up = completion.choices[0].message.content.strip()
    return RespondResponse(
        follow_up_question=follow_up if follow_up else None,
        is_complete=req.question_number >= max_questions - 1,
        next_question_number=req.question_number + 1,
    )


class EvaluateRequest(BaseModel):
    competency_name: str
    target_level: str
    transcript: str  # Full interview transcript
    indicators: list[str] = []


class EvaluateResponse(BaseModel):
    overall_score: float
    content_quality: float
    communication_clarity: float
    confidence: float
    professionalism: float
    feedback: str
    strengths: list[str]
    weaknesses: list[str]


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_interview(req: EvaluateRequest):
    """Evaluate full interview transcript against competency indicators."""
    if not client.api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    indicators_text = "\n".join(f"- {i}" for i in req.indicators) if req.indicators else "N/A"
    prompt = f"""Evaluate this interview transcript for competency "{req.competency_name}" at {req.target_level} level.

Indicators to assess:
{indicators_text}

Transcript:
{req.transcript}

Score each dimension 0-100:
- Content Quality (40%): Relevance, depth, examples
- Communication Clarity (30%): Clear expression, coherence
- Confidence (15%): Speech patterns, filler words
- Professionalism (15%): Language quality, tone

Return JSON:
{{
  "content_quality": 0-100,
  "communication_clarity": 0-100,
  "confidence": 0-100,
  "professionalism": 0-100,
  "overall_score": 0-100,
  "feedback": "2-3 sentence summary",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"]
}}"""
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    import json
    try:
        data = json.loads(completion.choices[0].message.content)
        return EvaluateResponse(
            overall_score=float(data.get("overall_score", 0)),
            content_quality=float(data.get("content_quality", 0)),
            communication_clarity=float(data.get("communication_clarity", 0)),
            confidence=float(data.get("confidence", 0)),
            professionalism=float(data.get("professionalism", 0)),
            feedback=data.get("feedback", ""),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
        )
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Evaluation parse error: {e}")
