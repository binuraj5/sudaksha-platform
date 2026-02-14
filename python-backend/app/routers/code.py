"""
Code Execution API - Internal (Piston) and HackerRank integration
"""
import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()


class ExecuteRequest(BaseModel):
    code: str
    language: str  # python, javascript, java, cpp
    test_cases: list[dict]  # [{input, expected_output}, ...]


class ExecuteResponse(BaseModel):
    passed: int
    total: int
    results: list[dict]
    execution_time_ms: Optional[float] = None
    error: Optional[str] = None


@router.post("/execute", response_model=ExecuteResponse)
async def execute_code(req: ExecuteRequest):
    """
    Execute code with test cases via Piston API.
    """
    piston_url = os.getenv("PISTON_API_URL", "https://emkc.org/api/v2/piston")
    lang_map = {
        "python": "python",
        "javascript": "javascript",
        "java": "java",
        "cpp": "cpp",
        "c++": "cpp",
    }
    lang = lang_map.get(req.language.lower(), req.language)
    results = []
    passed = 0
    for tc in req.test_cases:
        inp = tc.get("input", "")
        expected = str(tc.get("expected_output", "")).strip()
        try:
            payload = {
                "language": lang,
                "version": "*",
                "files": [{"content": req.code}],
                "stdin": inp,
            }
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"{piston_url}/execute", json=payload, timeout=30.0)
                data = resp.json()
            run = data.get("run", {})
            stdout = run.get("stdout", "").strip()
            stderr = run.get("stderr", "")
            ok = stdout == expected
            if ok:
                passed += 1
            results.append({
                "input": inp,
                "expected": expected,
                "actual": stdout,
                "passed": ok,
                "error": stderr if stderr else None,
            })
        except Exception as e:
            results.append({
                "input": inp,
                "expected": expected,
                "actual": None,
                "passed": False,
                "error": str(e),
            })
    return ExecuteResponse(
        passed=passed,
        total=len(req.test_cases),
        results=results,
    )
