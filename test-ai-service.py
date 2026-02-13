#!/usr/bin/env python3

import requests
import json

def test_ai_service():
    """Test if AI service is running and working."""
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ AI Service is running!")
            print(f"Health check response: {response.json()}")
        else:
            print(f"❌ AI Service responded with status: {response.status_code}")
            
        # Test course generation endpoint
        test_payload = {
            "topic": "Web Development with React",
            "industry": "software",
            "target_audience": "beginner",
            "context_prompt": "Test course generation"
        }
        
        print("\n🧪 Testing course generation...")
        response = requests.post(
            "http://localhost:8000/generate-course",
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            course_data = response.json()
            print("✅ Course generation successful!")
            print(f"Generated course: {course_data.get('name', 'Unknown')}")
            print(f"Category: {course_data.get('category', 'Unknown')}")
            print(f"Duration: {course_data.get('duration', 'Unknown')} hours")
            print(f"Price: ₹{course_data.get('price', 0)}")
        else:
            print(f"❌ Course generation failed with status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ AI Service is not running on localhost:8000")
        print("Please start the service first:")
        print("  cd python_service")
        print("  pip install -r requirements.txt")
        print("  python -m uvicorn main:app --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"❌ Error testing AI service: {e}")

if __name__ == "__main__":
    test_ai_service()
