#!/usr/bin/env python3

import requests
import json

def test_cors():
    """Test CORS from browser perspective."""
    url = "http://127.0.0.1:8000/generate-course"
    
    payload = {
        "topic": "Test Course from Browser",
        "industry": "software",
        "target_audience": "beginner",
        "context_prompt": "Testing CORS"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
        "Referer": "http://localhost:3000/admin/courses/create"
    }
    
    try:
        print("🧪 Testing CORS with browser-like headers...")
        print(f"URL: {url}")
        print(f"Origin: {headers['Origin']}")
        print(f"Referer: {headers['Referer']}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📋 CORS Headers:")
        
        cors_headers = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']
        for header in cors_headers:
            if header in response.headers:
                print(f"   {header}: {response.headers[header]}")
            else:
                print(f"   {header}: NOT PRESENT")
        
        if response.status_code == 200:
            course_data = response.json()
            print(f"\n✅ CORS Success! Generated course:")
            print(f"   Name: {course_data.get('name', 'N/A')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

if __name__ == "__main__":
    test_cors()
