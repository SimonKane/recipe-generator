from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import recipes_simple

app = FastAPI(
    title="Food Recipe Generator API",
    description="Backend API for saving and searching food recipes with semantic search",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recipes_simple.router, prefix="/api/v1/recipes", tags=["recipes"])

@app.get("/")
async def root():
    return {"message": "Food Recipe Generator API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}