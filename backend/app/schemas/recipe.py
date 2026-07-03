from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RecipeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    ingredients: List[str] = Field(..., min_items=1)
    instructions: str = Field(..., min_length=1)
    prep_time: Optional[int] = Field(None, ge=0, description="Preparation time in minutes")
    cook_time: Optional[int] = Field(None, ge=0, description="Cooking time in minutes")
    servings: Optional[int] = Field(None, ge=1, description="Number of servings")
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    cuisine: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = []

class RecipeCreate(RecipeBase):
    pass

class RecipeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    ingredients: Optional[List[str]] = Field(None, min_items=1)
    instructions: Optional[str] = Field(None, min_length=1)
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    cuisine: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None

class Recipe(RecipeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RecipeSearchResult(BaseModel):
    recipes: List[Recipe]
    total: int
    page: int
    size: int

class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query for semantic search")
    limit: Optional[int] = Field(10, ge=1, le=100, description="Maximum number of results")
    min_score: Optional[float] = Field(0.0, ge=0.0, le=1.0, description="Minimum similarity score")