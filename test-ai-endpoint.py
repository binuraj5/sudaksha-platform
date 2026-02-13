#!/usr/bin/env python3

import requests
import json

def test_ai_endpoint():
    """Test the AI course generation endpoint."""
    url = "http://127.0.0.1:8000/generate-course"
    
    payload = {
        "topic": "React Development",
        "industry": "software", 
        "target_audience": "beginner",
        "context_prompt": "Test course generation"
    }
    
    try:
        print("🧪 Testing AI endpoint...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            course_data = response.json()
            print(f"\n✅ Success! Generated course:")
            print(f"   Name: {course_data.get('name', 'N/A')}")
            print(f"   Category: {course_data.get('category', 'N/A')}")
            print(f"   Duration: {course_data.get('duration', 'N/A')} hours")
            print(f"   Price: ₹{course_data.get('price', 0)}")
            print(f"   Modules: {len(course_data.get('modules', []))}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_ai_endpoint()
