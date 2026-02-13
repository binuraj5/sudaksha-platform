from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import httpx
from datetime import datetime
import os
from dotenv import load_dotenv
import openai
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="Sudaksha AI Course Generator", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Pydantic Models for Course Structure
class LessonModel(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration: int  # in minutes
    order: int
    is_free: bool = False

class ModuleModel(BaseModel):
    title: str
    description: Optional[str] = None
    order: int
    duration: int  # in hours
    lessons: List[LessonModel]

class CourseGenerationRequest(BaseModel):
    topic: str = Field(..., description="Main topic of the course")
    industry: str = Field(..., description="Industry domain (e.g., Aviation, Defence)")
    target_audience: str = Field(..., description="Target audience description")
    context_prompt: str = Field(..., description="Additional context for course generation")

class CourseGenerationResponse(BaseModel):
    name: str
    slug: str
    category: str
    description: str
    short_description: Optional[str] = None
    duration: int  # in hours
    price: float
    audience_level: str
    skill_tags: List[str]
    learning_objectives: List[str]
    modules: List[ModuleModel]

# Industry to Category Mapping
INDUSTRY_CATEGORY_MAP = {
    "aviation": "SOFTWARE_DEVELOPMENT",
    "defence": "CYBERSECURITY",
    "software": "SOFTWARE_DEVELOPMENT",
    "data": "DATA_ANALYTICS",
    "cloud": "CLOUD_DEVOPS",
    "ai": "AI_ML",
    "cybersecurity": "CYBERSECURITY",
    "business": "BUSINESS_ANALYSIS",
    "project": "PROJECT_MANAGEMENT",
    "marketing": "DIGITAL_MARKETING",
    "communication": "COMMUNICATION",
    "leadership": "LEADERSHIP",
    "sales": "BUSINESS_ANALYSIS",
    "retail": "BUSINESS_ANALYSIS",
    "pharma": "BUSINESS_ANALYSIS",
    "services": "BUSINESS_ANALYSIS",
    "fresher": "BUSINESS_ANALYSIS",
    "graduate": "BUSINESS_ANALYSIS"
}

# Audience Level Mapping
AUDIENCE_LEVEL_MAP = {
    "beginner": "BEGINNER",
    "intermediate": "INTERMEDIATE", 
    "advanced": "ADVANCED",
    "all": "ALL_LEVELS"
}

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from course name."""
    return name.lower().replace(" ", "-").replace("/", "-").replace(":", "").strip()

def construct_system_prompt(request: CourseGenerationRequest) -> str:
    """Construct comprehensive system prompt for LLM."""
    
    # Detect if this is a sales course
    topic_lower = request.topic.lower()
    context_lower = request.context_prompt.lower()
    is_sales_course = any(keyword in topic_lower or keyword in context_lower 
                         for keyword in ['sales', 'selling', 'fresher', 'graduate', 'entry-level', 'backend', 'field sales'])
    
    if is_sales_course:
        industry_focus = "Sales and Business Development"
        category = "BUSINESS_ANALYSIS"
        price_range = "₹8,000 - ₹25,000"
        target_audience_desc = "Fresh graduates and entry-level professionals"
    else:
        industry_focus = f"{request.industry} industry"
        category = "SOFTWARE_DEVELOPMENT"  # default
        price_range = "₹5,000 - ₹50,000"
        target_audience_desc = request.target_audience
    
    return f"""
You are an expert instructional designer and course creator for {industry_focus}.
Generate a comprehensive course structure for the topic: "{request.topic}"

Target Audience: {target_audience_desc}
Additional Context: {request.context_prompt}

Requirements:
1. Create a professional course with 3-6 modules
2. Each module should have 3-8 lessons
3. Total course duration should be 20-60 hours
4. Content should be practical and industry-relevant
5. Include clear learning objectives and skill tags
6. Price should be realistic for the industry ({price_range})

IMPORTANT: If this is a sales course, focus on:
- Sales fundamentals and techniques
- Communication and negotiation skills
- Customer relationship management
- Industry-agnostic selling skills
- Both backend (inside sales) and field sales skills

Return ONLY a JSON object with this exact structure:
{{
    "name": "Course Title",
    "category": "{category}",
    "description": "Detailed course description (100-200 words)",
    "short_description": "Brief description (30-50 words)",
    "duration": 40,
    "price": 15000.00,
    "audience_level": "BEGINNER|INTERMEDIATE|ADVANCED|ALL_LEVELS",
    "skill_tags": ["skill1", "skill2", "skill3"],
    "learning_objectives": ["objective1", "objective2", "objective3"],
    "modules": [
        {{
            "title": "Module Title",
            "description": "Module description",
            "order": 1,
            "duration": 10,
            "lessons": [
                {{
                    "title": "Lesson Title",
                    "description": "Lesson description",
                    "duration": 45,
                    "order": 1,
                    "is_free": false
                }}
            ]
        }}
    ]
}}

Category must be one of: SOFTWARE_DEVELOPMENT, DATA_ANALYTICS, CLOUD_DEVOPS, AI_ML, CYBERSECURITY, BUSINESS_ANALYSIS, PROJECT_MANAGEMENT, DIGITAL_MARKETING, COMMUNICATION, LEADERSHIP
"""

async def generate_course_with_llm(request: CourseGenerationRequest) -> Dict[str, Any]:
    """Generate course using GPT-4o."""
    try:
        system_prompt = construct_system_prompt(request)

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a comprehensive course on: {request.topic}"}
            ],
            temperature=0.7,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )

        # Parse the JSON response
        course_data = json.loads(response.choices[0].message.content)

        # Validate required fields
        required_fields = ["name", "category", "description", "duration", "price", "audience_level", "skill_tags", "learning_objectives", "modules"]
        for field in required_fields:
            if field not in course_data:
                raise ValueError(f"Missing required field: {field}")

        # Ensure modules have proper structure
        for i, module in enumerate(course_data["modules"]):
            if "lessons" not in module:
                module["lessons"] = []
            for j, lesson in enumerate(module["lessons"]):
                lesson.setdefault("is_free", False)
                lesson.setdefault("order", j + 1)

        return course_data

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        # Fallback to template-based generation if AI fails
        print(f"AI generation failed: {str(e)}, using fallback")
        return generate_course_fallback(request)

def generate_course_fallback(request: CourseGenerationRequest) -> Dict[str, Any]:
    """Fallback course generation when AI is unavailable."""
    category = INDUSTRY_CATEGORY_MAP.get(request.industry.lower(), "SOFTWARE_DEVELOPMENT")
    audience_level = AUDIENCE_LEVEL_MAP.get(request.target_audience.lower(), "ALL_LEVELS")

    return {
        "name": f"{request.topic} Training Program",
        "category": category,
        "description": f"Comprehensive training program on {request.topic} designed specifically for {request.industry} professionals. This course covers essential concepts, practical applications, and industry best practices to help you excel in your career.",
        "short_description": f"Master {request.topic} with industry-focused training for {request.industry} professionals.",
        "duration": 40,
        "price": 25000.00,
        "audience_level": audience_level,
        "skill_tags": [
            request.topic.lower().replace(" ", "-"),
            request.industry.lower(),
            "practical-skills",
            "industry-application",
            "professional-development"
        ],
        "learning_objectives": [
            f"Understand core concepts and principles of {request.topic}",
            f"Apply {request.topic} knowledge in {request.industry} contexts",
            "Develop practical implementation and problem-solving skills",
            "Follow industry standards and best practices",
            "Build confidence in applying learned concepts professionally"
        ],
        "modules": [
            {
                "title": f"Introduction to {request.topic}",
                "description": f"Fundamental concepts, terminology, and overview of {request.topic} in the {request.industry} industry",
                "order": 1,
                "duration": 8,
                "lessons": [
                    {
                        "title": "Course Overview and Learning Objectives",
                        "description": "Introduction to course structure, learning outcomes, and assessment methods",
                        "duration": 45,
                        "order": 1,
                        "is_free": True
                    },
                    {
                        "title": f"Core Concepts of {request.topic}",
                        "description": "Essential terminology, definitions, and foundational knowledge",
                        "duration": 90,
                        "order": 2,
                        "is_free": False
                    },
                    {
                        "title": f"{request.industry} Industry Context",
                        "description": f"How {request.topic} applies to real-world {request.industry} scenarios",
                        "duration": 75,
                        "order": 3,
                        "is_free": False
                    }
                ]
            },
            {
                "title": "Practical Application and Implementation",
                "description": f"Hands-on exercises, case studies, and real-world application of {request.topic}",
                "order": 2,
                "duration": 16,
                "lessons": [
                    {
                        "title": "Tools and Environment Setup",
                        "description": "Setting up development environment and required tools",
                        "duration": 90,
                        "order": 1,
                        "is_free": False
                    },
                    {
                        "title": "Basic Implementation",
                        "description": "Step-by-step practical exercises and implementation",
                        "duration": 120,
                        "order": 2,
                        "is_free": False
                    },
                    {
                        "title": "Advanced Techniques and Best Practices",
                        "description": "Complex scenarios, optimization, and industry best practices",
                        "duration": 150,
                        "order": 3,
                        "is_free": False
                    }
                ]
            },
            {
                "title": f"Industry Projects and Case Studies",
                "description": f"Real-world {request.industry} projects, case studies, and capstone work",
                "order": 3,
                "duration": 16,
                "lessons": [
                    {
                        "title": "Industry Case Study Analysis",
                        "description": "Analysis of real industry case studies and lessons learned",
                        "duration": 120,
                        "order": 1,
                        "is_free": False
                    },
                    {
                        "title": "Capstone Project Implementation",
                        "description": "Complete end-to-end project implementation",
                        "duration": 180,
                        "order": 2,
                        "is_free": False
                    },
                    {
                        "title": "Final Assessment and Certification",
                        "description": "Comprehensive assessment and course completion certification",
                        "duration": 60,
                        "order": 3,
                        "is_free": False
                    }
                ]
            }
        ]
    }

@app.post("/generate-course", response_model=CourseGenerationResponse)
async def generate_course(request: CourseGenerationRequest):
    """Generate a complete course structure using AI."""
    try:
        # Generate course content
        course_data = await generate_course_with_llm(request)
        
        # Generate slug
        course_data["slug"] = generate_slug(course_data["name"])
        
        # Validate response structure
        response = CourseGenerationResponse(**course_data)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Course generation failed: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Sudaksha AI Course Generator is running"}

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint for CORS debugging."""
    return {"status": "ok", "message": "CORS test endpoint working"}

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
