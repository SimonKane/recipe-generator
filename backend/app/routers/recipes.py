from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.schemas.recipe import Recipe, RecipeCreate, RecipeUpdate, RecipeSearchResult, SemanticSearchRequest
# Temporarily comment out ML services
# from app.services.recipe_service import RecipeService
# from app.services.semantic_search_service import SemanticSearchService

router = APIRouter()

def get_recipe_service():
    return RecipeService()

def get_search_service():
    return SemanticSearchService()

@router.post("/", response_model=Recipe)
async def create_recipe(
    recipe: RecipeCreate, 
    service: RecipeService = Depends(get_recipe_service)
):
    """Create a new recipe"""
    try:
        return await service.create_recipe(recipe)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=RecipeSearchResult)
async def get_recipes(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search term for title or description"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    service: RecipeService = Depends(get_recipe_service)
):
    """Get recipes with pagination and filtering"""
    try:
        return await service.get_recipes(page, size, search, cuisine, difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe(
    recipe_id: int, 
    service: RecipeService = Depends(get_recipe_service)
):
    """Get a specific recipe by ID"""
    recipe = await service.get_recipe_by_id(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.put("/{recipe_id}", response_model=Recipe)
async def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    service: RecipeService = Depends(get_recipe_service)
):
    """Update a recipe"""
    recipe = await service.update_recipe(recipe_id, recipe_update)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.delete("/{recipe_id}")
async def delete_recipe(
    recipe_id: int,
    service: RecipeService = Depends(get_recipe_service)
):
    """Delete a recipe"""
    success = await service.delete_recipe(recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"message": "Recipe deleted successfully"}

@router.post("/search/semantic", response_model=List[Recipe])
async def semantic_search(
    search_request: SemanticSearchRequest,
    search_service: SemanticSearchService = Depends(get_search_service)
):
    """Perform semantic search on recipes"""
    try:
        return await search_service.semantic_search(
            search_request.query, 
            search_request.limit, 
            search_request.min_score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))