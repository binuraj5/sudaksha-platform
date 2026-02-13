@echo off
echo Starting Sudaksha AI Course Generator Service...
echo.
echo Make sure you have Python 3.11+ installed
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "python_service\main.py" (
    echo ERROR: Please run this script from the project root directory
    echo The python_service\main.py file should be found
    pause
    exit /b 1
)

REM Change to python_service directory
cd python_service

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found
    echo Please ensure the python_service directory is complete
    pause
    exit /b 1
)

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Start the service
echo.
echo Starting AI service on http://localhost:8000
echo Press Ctrl+C to stop the service
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
