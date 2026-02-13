#!/bin/bash

echo "Starting Sudaksha AI Course Generator Service..."
echo "Make sure you have Python 3.11+ installed"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python from https://python.org"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "python_service/main.py" ]; then
    echo "ERROR: Please run this script from the project root directory"
    echo "The python_service/main.py file should be found"
    exit 1
fi

# Change to python_service directory
cd python_service

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "ERROR: requirements.txt not found"
    echo "Please ensure the python_service directory is complete"
    exit 1
fi

# Install dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

# Start the service
echo ""
echo "Starting AI service on http://localhost:8000"
echo "Press Ctrl+C to stop the service"
echo ""
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
