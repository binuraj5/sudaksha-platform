#!/usr/bin/env python3

import sys
import os

# Change to python_service directory
os.chdir('python_service')
print(f"Changed to directory: {os.getcwd()}")

# Add current directory to path
sys.path.insert(0, os.getcwd())

try:
    import uvicorn
    from main import app
    
    print("🚀 Starting Sudaksha AI Course Generator Service...")
    print("📍 Service will be available at: http://localhost:8000")
    print("📊 Health check: http://localhost:8000/health")
    print("🎯 Course generation: http://localhost:8000/generate-course")
    print("⏹️  Press Ctrl+C to stop the service")
    print()
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install dependencies: pip install fastapi uvicorn openai pydantic python-dotenv httpx")
except Exception as e:
    print(f"❌ Error starting service: {e}")
    import traceback
    traceback.print_exc()
