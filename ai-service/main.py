from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="Sudaksha AI Course Generator", version="1.0.0")

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class CourseGenerationRequest(BaseModel):
    context: str
    industry: str
    target_audience: str
    duration_hours: int = 40
    price: float = 25000

class CourseGenerationResponse(BaseModel):
    course: Dict[str, Any]
    modules: List[Dict[str, Any]]
    lessons: List[Dict[str, Any]]

@app.post("/generate-course", response_model=CourseGenerationResponse)
async def generate_course(request: CourseGenerationRequest):
    """
    Generate a complete course structure using AI based on training context
    """
    try:
        prompt = f"""
You are an expert course designer for Sudaksha NWS, specializing in IT and professional training programs.

Based on the following training context, create a comprehensive course structure:

CONTEXT: {request.context}
INDUSTRY: {request.industry}
TARGET AUDIENCE: {request.target_audience}
DURATION: {request.duration_hours} hours
PRICE: ₹{request.price}

REQUIREMENTS:
1. Categorize this course into ONE of these categories: SOFTWARE_DEVELOPMENT, DATA_ANALYTICS, CLOUD_DEVOPS, AI_ML, CYBERSECURITY, BUSINESS_ANALYSIS, PROJECT_MANAGEMENT, DIGITAL_MARKETING, COMMUNICATION, LEADERSHIP

2. Determine the appropriate level: JUNIOR, MIDDLE, SENIOR, MANAGEMENT, EXECUTIVE

3. Create a course with 4-8 modules, each with 3-6 lessons

4. Generate realistic skill tags (5-10 relevant skills)

5. Create measurable learning objectives (4-6 objectives)

6. Structure the module breakdown as a proper JSON object

7. Determine if this is IT or Non-IT category type

8. Set appropriate duration for each module and lesson

Return a JSON object with this exact structure:
{{
  "course": {{
    "name": "Course Title",
    "slug": "course-slug",
    "category": "CATEGORY_ENUM",
    "courseType": "TECHNOLOGY|IT|FUNCTIONAL|PROCESS|BEHAVIORAL|PERSONAL",
    "description": "Detailed course description",
    "shortDescription": "Brief description for cards",
    "duration": {request.duration_hours},
    "price": {request.price},
    "audienceLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
    "level": "JUNIOR|MIDDLE|SENIOR|MANAGEMENT|EXECUTIVE",
    "industry": "{request.industry}",
    "isIT": true/false,
    "skillTags": ["skill1", "skill2", ...],
    "learningObjectives": ["objective1", "objective2", ...],
    "moduleBreakdown": {{
      "modules": [
        {{
          "id": "module1",
          "title": "Module Title",
          "duration": 8,
          "lessons": [
            {{
              "id": "lesson1",
              "title": "Lesson Title",
              "duration": 45
            }}
          ]
        }}
      ]
    }}
  }},
  "modules": [
    {{
      "title": "Module 1 Title",
      "description": "Module description",
      "order": 1,
      "duration": 8,
      "courseId": "will-be-set-by-backend"
    }}
  ],
  "lessons": [
    {{
      "title": "Lesson 1 Title",
      "description": "Lesson description",
      "content": "Lesson content",
      "duration": 45,
      "order": 1,
      "isFree": false,
      "moduleId": "will-be-set-by-backend"
    }}
  ]
}}

Ensure all durations add up correctly and the content is professional and educational.
"""

        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional course designer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )

        # Parse the AI response
        ai_response = json.loads(response.choices[0].message.content)

        return CourseGenerationResponse(**ai_response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Course generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Course Generator"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
