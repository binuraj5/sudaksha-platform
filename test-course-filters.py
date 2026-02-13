#!/usr/bin/env python3

import requests
import json

def test_course_filters():
    """Test the course creation with all filter fields."""
    url = "http://localhost:3000/api/courses"
    
    # Test course with all filter fields
    course_data = {
        "name": "Advanced Sales Mastery Program",
        "category": "business",
        "duration": "12",
        "price": "35000",
        "description": "Comprehensive sales training program for experienced professionals",
        "shortDescription": "Advanced sales techniques and strategies",
        "prerequisites": "Basic sales experience, communication skills",
        "objectives": "Master advanced sales techniques, develop strategic thinking",
        "curriculum": "Week 1-4: Advanced Sales Strategies\nWeek 5-8: Client Relationship Management\nWeek 9-12: Sales Leadership",
        "status": "active",
        # Professional Programs
        "domain": "Non-IT",
        # Industry Focus
        "industry": "Consulting",
        # Career Level
        "targetLevel": "INTERMEDIATE",
        # Course Type
        "courseType": "FUNCTIONAL",
        # Delivery Mode
        "deliveryMode": "HYBRID",
        # Special Features
        "isPopular": True,
        "isNew": False,
        "hasPlacementSupport": True,
        "hasEMI": True,
        # Rating
        "rating": 0,
        # Additional fields
        "imageUrl": "/images/courses/sales-advanced.jpg",
        "skillTags": ["Sales", "Leadership", "Strategy", "Communication"],
        "learningObjectives": ["Advanced sales techniques", "Strategic thinking", "Leadership skills"],
        "created_at": "2024-01-02T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z"
    }
    
    try:
        print("🧪 Testing course creation with all filters...")
        print(f"URL: {url}")
        print(f"Course: {course_data['name']}")
        print(f"Domain: {course_data['domain']}")
        print(f"Industry: {course_data['industry']}")
        print(f"Course Type: {course_data['courseType']}")
        print(f"Delivery Mode: {course_data['deliveryMode']}")
        
        response = requests.post(url, json=course_data, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Success! Course created:")
            print(f"   ID: {result.get('course', {}).get('id', 'N/A')}")
            print(f"   Name: {result.get('course', {}).get('name', 'N/A')}")
            print(f"   Category: {result.get('course', {}).get('category', 'N/A')}")
            print(f"   Domain: {result.get('course', {}).get('categoryType', 'N/A')}")
            print(f"   Industry: {result.get('course', {}).get('industry', 'N/A')}")
            print(f"   Target Level: {result.get('course', {}).get('targetLevel', 'N/A')}")
            print(f"   Course Type: {result.get('course', {}).get('courseType', 'N/A')}")
            print(f"   Delivery Mode: {result.get('course', {}).get('deliveryMode', 'N/A')}")
            print(f"   Popular: {result.get('course', {}).get('isPopular', 'N/A')}")
            print(f"   New: {result.get('course', {}).get('isNew', 'N/A')}")
            print(f"   Placement Support: {result.get('course', {}).get('hasPlacementSupport', 'N/A')}")
            print(f"   EMI Available: {result.get('course', {}).get('hasEMI', 'N/A')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_course_filters()
