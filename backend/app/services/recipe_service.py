from typing import List, Optional
from sqlalchemy import select, func, and_, or_
from app.database import database
from app.models.recipe import Recipe as RecipeModel
from app.schemas.recipe import Recipe, RecipeCreate, RecipeUpdate, RecipeSearchResult
from app.services.semantic_search_service import SemanticSearchService
import json

class RecipeService:
    def __init__(self):
        self.semantic_service = SemanticSearchService()

    async def create_recipe(self, recipe_data: RecipeCreate) -> Recipe:
        """Create a new recipe with semantic embedding"""
        # Generate embedding for semantic search
        recipe_text = f"{recipe_data.title} {recipe_data.description or ''} {' '.join(recipe_data.ingredients)} {recipe_data.instructions}"
        embedding = await self.semantic_service.generate_embedding(recipe_text)
        
        query = """
        INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, 
                           servings, difficulty, cuisine, tags, embedding, created_at) 
        VALUES (:title, :description, :ingredients, :instructions, :prep_time, :cook_time, 
                :servings, :difficulty, :cuisine, :tags, :embedding, NOW()) 
        RETURNING *
        """
        
        values = {
            "title": recipe_data.title,
            "description": recipe_data.description,
            "ingredients": json.dumps(recipe_data.ingredients),
            "instructions": recipe_data.instructions,
            "prep_time": recipe_data.prep_time,
            "cook_time": recipe_data.cook_time,
            "servings": recipe_data.servings,
            "difficulty": recipe_data.difficulty,
            "cuisine": recipe_data.cuisine,
            "tags": json.dumps(recipe_data.tags) if recipe_data.tags else None,
            "embedding": json.dumps(embedding.tolist()) if embedding is not None else None
        }
        
        result = await database.fetch_one(query=query, values=values)
        return self._row_to_recipe(result)

    async def get_recipe_by_id(self, recipe_id: int) -> Optional[Recipe]:
        """Get a recipe by ID"""
        query = "SELECT * FROM recipes WHERE id = :recipe_id"
        result = await database.fetch_one(query=query, values={"recipe_id": recipe_id})
        return self._row_to_recipe(result) if result else None

    async def get_recipes(
        self, 
        page: int = 1, 
        size: int = 10, 
        search: Optional[str] = None,
        cuisine: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> RecipeSearchResult:
        """Get recipes with pagination and filtering"""
        offset = (page - 1) * size
        
        # Build WHERE conditions
        conditions = []
        values = {"limit": size, "offset": offset}
        
        if search:
            conditions.append("(title ILIKE :search OR description ILIKE :search)")
            values["search"] = f"%{search}%"
        
        if cuisine:
            conditions.append("cuisine ILIKE :cuisine")
            values["cuisine"] = f"%{cuisine}%"
        
        if difficulty:
            conditions.append("difficulty = :difficulty")
            values["difficulty"] = difficulty
        
        where_clause = " AND ".join(conditions) if conditions else "TRUE"
        
        # Count total recipes
        count_query = f"SELECT COUNT(*) FROM recipes WHERE {where_clause}"
        total = await database.fetch_val(query=count_query, values=values)
        
        # Get recipes
        query = f"""
        SELECT * FROM recipes 
        WHERE {where_clause} 
        ORDER BY created_at DESC 
        LIMIT :limit OFFSET :offset
        """
        
        results = await database.fetch_all(query=query, values=values)
        recipes = [self._row_to_recipe(row) for row in results]
        
        return RecipeSearchResult(
            recipes=recipes,
            total=total,
            page=page,
            size=size
        )

    async def update_recipe(self, recipe_id: int, recipe_update: RecipeUpdate) -> Optional[Recipe]:
        """Update a recipe"""
        # Get current recipe
        current_recipe = await self.get_recipe_by_id(recipe_id)
        if not current_recipe:
            return None
        
        # Build update data
        update_data = {}
        update_fields = []
        
        for field, value in recipe_update.model_dump(exclude_unset=True).items():
            if field == "ingredients" or field == "tags":
                update_data[field] = json.dumps(value) if value is not None else None
            else:
                update_data[field] = value
            update_fields.append(f"{field} = :{field}")
        
        if not update_fields:
            return current_recipe
        
        # Regenerate embedding if content changed
        content_fields = {'title', 'description', 'ingredients', 'instructions'}
        if any(field in recipe_update.model_dump(exclude_unset=True) for field in content_fields):
            # Merge updated data with current recipe
            updated_recipe_data = current_recipe.model_dump()
            updated_recipe_data.update(recipe_update.model_dump(exclude_unset=True))
            
            recipe_text = f"{updated_recipe_data['title']} {updated_recipe_data.get('description', '') or ''} {' '.join(updated_recipe_data['ingredients'])} {updated_recipe_data['instructions']}"
            embedding = await self.semantic_service.generate_embedding(recipe_text)
            update_data["embedding"] = json.dumps(embedding.tolist()) if embedding is not None else None
            update_fields.append("embedding = :embedding")
        
        update_data["recipe_id"] = recipe_id
        update_fields.append("updated_at = NOW()")
        
        query = f"""
        UPDATE recipes 
        SET {', '.join(update_fields)} 
        WHERE id = :recipe_id 
        RETURNING *
        """
        
        result = await database.fetch_one(query=query, values=update_data)
        return self._row_to_recipe(result) if result else None

    async def delete_recipe(self, recipe_id: int) -> bool:
        """Delete a recipe"""
        query = "DELETE FROM recipes WHERE id = :recipe_id"
        result = await database.execute(query=query, values={"recipe_id": recipe_id})
        return result > 0

    def _row_to_recipe(self, row) -> Recipe:
        """Convert database row to Recipe model"""
        if not row:
            return None
        
        return Recipe(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            ingredients=json.loads(row["ingredients"]) if row["ingredients"] else [],
            instructions=row["instructions"],
            prep_time=row["prep_time"],
            cook_time=row["cook_time"],
            servings=row["servings"],
            difficulty=row["difficulty"],
            cuisine=row["cuisine"],
            tags=json.loads(row["tags"]) if row["tags"] else [],
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )