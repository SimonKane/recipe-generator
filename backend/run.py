#!/usr/bin/env python3
"""
Development server runner for the Food Recipe Backend API.
Use this for local development with hot reloading.
"""

import uvicorn
import os
from pathlib import Path

def main():
    """Start the development server with hot reloading."""
    # Get environment variables with defaults
    host = os.getenv("HOST", "127.0.0.1")  # Changed to localhost for development
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info")
    
    # Ensure we're in the backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print(f"🚀 Starting Food Recipe Backend API...")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔄 Hot reload: {reload}")
    print(f"📊 Log level: {log_level}")
    print(f"📁 Working directory: {backend_dir}")
    print(f"🌐 API Documentation: http://{host}:{port}/docs")
    print(f"📖 ReDoc: http://{host}:{port}/redoc")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=log_level,
        reload_dirs=["app"] if reload else None
    )

if __name__ == "__main__":
    main()