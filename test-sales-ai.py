#!/usr/bin/env python3

import requests
import json

def test_sales_ai():
    """Test the AI course generation with sales content."""
    url = "http://127.0.0.1:8000/generate-course"
    
    payload = {
        "topic": "Entry-Level Sales Mastery for Freshers: Universal Skills for Backend and Field Sales",
        "industry": "sales", 
        "target_audience": "beginner",
        "context_prompt": "You are an expert sales trainer tasked with creating a comprehensive online course titled 'Entry-Level Sales Mastery for Freshers: Universal Skills for Backend and Field Sales.' This course targets freshers entering sales roles in any industry, focusing on building foundational skills applicable to both backend sales (remote support, data management, inside sales) and field sales (in-person interactions, territory management). The course should be engaging, practical, and industry-agnostic, using real-world examples from various sectors like tech, retail, pharma, and services."
    }
    
    try:
        print("🧪 Testing Sales AI generation...")
        print(f"URL: {url}")
        print(f"Topic: {payload['topic']}")
        print(f"Industry: {payload['industry']}")
        
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            course_data = response.json()
            print(f"\n✅ Success! Generated sales course:")
            print(f"   Name: {course_data.get('name', 'N/A')}")
            print(f"   Category: {course_data.get('category', 'N/A')}")
            print(f"   Duration: {course_data.get('duration', 'N/A')} hours")
            print(f"   Price: ₹{course_data.get('price', 0)}")
            print(f"   Audience Level: {course_data.get('audience_level', 'N/A')}")
            print(f"   Skill Tags: {course_data.get('skill_tags', [])}")
            print(f"   Modules: {len(course_data.get('modules', []))}")
            
            # Check if it's properly detected as sales course
            if course_data.get('category') == 'BUSINESS_ANALYSIS':
                print(f"\n🎯 CORRECTLY detected as sales/business course!")
            else:
                print(f"\n⚠️  Category issue: Expected BUSINESS_ANALYSIS, got {course_data.get('category')}")
                
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_sales_ai()
