#!/usr/bin/env python3

import sys
import os

print("Python version:", sys.version)
print("Current directory:", os.getcwd())
print("Python path:")
for p in sys.path:
    print("  ", p)

print("\nTesting imports...")

try:
    import fastapi
    print("✅ fastapi imported successfully")
except ImportError as e:
    print("❌ fastapi import failed:", e)

try:
    import uvicorn
    print("✅ uvicorn imported successfully")
except ImportError as e:
    print("❌ uvicorn import failed:", e)

try:
    import openai
    print("✅ openai imported successfully")
except ImportError as e:
    print("❌ openai import failed:", e)

try:
    import pydantic
    print("✅ pydantic imported successfully")
except ImportError as e:
    print("❌ pydantic import failed:", e)

try:
    from python_service.main import app
    print("✅ main app imported successfully")
except ImportError as e:
    print("❌ main app import failed:", e)

print("\nDone!")
