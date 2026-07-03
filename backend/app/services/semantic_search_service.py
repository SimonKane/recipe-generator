from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.database import database
from app.schemas.recipe import Recipe
from app.services.recipe_service import RecipeService
import json
import asyncio
import threading

class SemanticSearchService:
    _model = None
    _lock = threading.Lock()
    
    def __init__(self):
        self.model = self._get_model()
    
    @classmethod
    def _get_model(cls):
        """Get the sentence transformer model (singleton pattern)"""
        if cls._model is None:
            with cls._lock:
                if cls._model is None:
                    # Use a lightweight model for better performance
                    cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._model
    
    async def generate_embedding(self, text: str) -> Optional[np.ndarray]:
        """Generate embedding for given text"""
        try:
            # Run the embedding generation in a thread to avoid blocking
            loop = asyncio.get_event_loop()
            embedding = await loop.run_in_executor(
                None, 
                lambda: self.model.encode([text], convert_to_tensor=False)[0]
            )
            return embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    async def semantic_search(self, query: str, limit: int = 10, min_score: float = 0.0) -> List[Recipe]:
        """Perform semantic search on recipes"""
        try:
            # Generate embedding for the search query
            query_embedding = await self.generate_embedding(query)
            if query_embedding is None:
                return []
            
            # Get all recipes with embeddings
            recipes_query = """
            SELECT id, title, description, ingredients, instructions, prep_time, cook_time, 
                   servings, difficulty, cuisine, tags, embedding, created_at, updated_at
            FROM recipes 
            WHERE embedding IS NOT NULL
            """
            
            recipes_data = await database.fetch_all(query=recipes_query)
            if not recipes_data:
                return []
            
            # Calculate similarities
            similarities = []
            recipe_objects = []
            
            for row in recipes_data:
                try:
                    recipe_embedding = np.array(json.loads(row["embedding"]))
                    
                    # Calculate cosine similarity
                    similarity = cosine_similarity(
                        [query_embedding], 
                        [recipe_embedding]
                    )[0][0]
                    
                    if similarity >= min_score:
                        similarities.append((similarity, row))
                        
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"Error processing embedding for recipe {row['id']}: {e}")
                    continue
            
            # Sort by similarity score (descending)
            similarities.sort(key=lambda x: x[0], reverse=True)
            
            # Convert to Recipe objects and limit results
            results = []
            for similarity_score, row in similarities[:limit]:
                recipe = self._row_to_recipe(row)
                if recipe:
                    results.append(recipe)
            
            return results
            
        except Exception as e:
            print(f"Error in semantic search: {e}")
            return []
    
    async def reindex_all_recipes(self):
        """Regenerate embeddings for all recipes (useful for maintenance)"""
        try:
            # Get all recipes without embeddings or with null embeddings
            recipes_query = """
            SELECT id, title, description, ingredients, instructions
            FROM recipes
            """
            
            recipes = await database.fetch_all(query=recipes_query)
            
            for recipe in recipes:
                recipe_text = f"{recipe['title']} {recipe['description'] or ''} {' '.join(json.loads(recipe['ingredients']) if recipe['ingredients'] else [])} {recipe['instructions']}"
                embedding = await self.generate_embedding(recipe_text)
                
                if embedding is not None:
                    update_query = """
                    UPDATE recipes 
                    SET embedding = :embedding 
                    WHERE id = :recipe_id
                    """
                    
                    await database.execute(
                        query=update_query, 
                        values={
                            "embedding": json.dumps(embedding.tolist()),
                            "recipe_id": recipe["id"]
                        }
                    )
            
            print(f"Reindexed {len(recipes)} recipes")
            
        except Exception as e:
            print(f"Error reindexing recipes: {e}")
    
    def _row_to_recipe(self, row) -> Optional[Recipe]:
        """Convert database row to Recipe model"""
        try:
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
        except Exception as e:
            print(f"Error converting row to recipe: {e}")
            return None