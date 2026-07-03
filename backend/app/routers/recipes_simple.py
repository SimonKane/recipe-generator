from fastapi import APIRouter
from typing import Dict
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# In-memory storage for demonstration (in production, use database)
saved_recipes = []
recipe_id_counter = 1

# Simple recipe model for testing
class SimpleRecipe(BaseModel):
    title: str
    description: Optional[str] = ""
    ingredients: List[str] = []
    instructions: str
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = 1
    difficulty: Optional[str] = "medium"
    cuisine: Optional[str] = ""
    tags: Optional[List[str]] = []
    
    class Config:
        # Allow extra fields and be more lenient with validation
        extra = "ignore"
        str_strip_whitespace = True

# Simple endpoints without database dependency for initial testing
@router.get("/", response_model=Dict)
async def get_recipes(
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
    cuisine: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Get recipes - simplified version using in-memory storage"""
    print(f"GET /recipes called with page={page}, size={size}, search={search}")
    
    # Filter recipes based on search criteria
    filtered_recipes = saved_recipes.copy()
    
    if search:
        filtered_recipes = [r for r in filtered_recipes if 
                          search.lower() in r.get("title", "").lower() or 
                          search.lower() in r.get("description", "").lower()]
    
    if cuisine:
        filtered_recipes = [r for r in filtered_recipes if r.get("cuisine", "").lower() == cuisine.lower()]
    
    if difficulty:
        filtered_recipes = [r for r in filtered_recipes if r.get("difficulty", "").lower() == difficulty.lower()]
    
    # Pagination
    start = (page - 1) * size
    end = start + size
    paginated_recipes = filtered_recipes[start:end]
    
    print(f"Returning {len(paginated_recipes)} recipes out of {len(filtered_recipes)} total")
    
    return {
        "recipes": paginated_recipes,
        "total": len(filtered_recipes),
        "page": page,
        "size": size
    }

@router.get("/health", response_model=Dict)
async def recipes_health_check():
    """Health check endpoint for recipes"""
    return {
        "status": "healthy", 
        "message": "Recipes API is running",
        "ml_status": "disabled (install sentence-transformers to enable)",
        "database_status": "not connected (configure DATABASE_URL)"
    }

@router.post("/", response_model=Dict)
async def create_recipe(recipe: SimpleRecipe):
    """Create a new recipe - simplified version for testing"""
    global recipe_id_counter
    
    # Debug: Print the received recipe
    print(f"Received recipe: {recipe.model_dump()}")
    
    # Create recipe with ID and timestamps
    recipe_data = {
        "id": recipe_id_counter,
        "title": recipe.title,
        "description": recipe.description,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "servings": recipe.servings,
        "difficulty": recipe.difficulty,
        "cuisine": recipe.cuisine,
        "tags": recipe.tags,
        "created_at": "2024-10-09T00:00:00Z",
        "updated_at": "2024-10-09T00:00:00Z"
    }
    
    # Save to in-memory storage
    saved_recipes.append(recipe_data)
    recipe_id_counter += 1
    
    print(f"Recipe saved with ID {recipe_data['id']}. Total recipes: {len(saved_recipes)}")
    
    return {
        "message": "Recipe saved successfully!",
        "status": "success",
        "recipe": recipe_data,
        "note": f"Recipe saved in memory (ID: {recipe_data['id']}). Total saved recipes: {len(saved_recipes)}"
    }

@router.post("/test-cors", response_model=Dict)
async def test_cors_endpoint():
    """Test endpoint to verify CORS is working"""
    return {
        "message": "CORS is working!",
        "status": "success",
        "timestamp": "2024-10-09",
        "frontend_can_save_recipes": True
    }