import json
import re
import urllib.error
import urllib.request
from urllib.parse import quote
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlite3 import Connection

from app.config import settings
from app.database import get_db, row_to_recipe

router = APIRouter()
GENERATED_CLIENTS: set[str] = set()


class RecipeIn(BaseModel):
    title: str
    description: str | None = ""
    ingredients: list[str] = Field(default_factory=list)
    instructions: str
    prep_time: int | None = None
    cook_time: int | None = None
    servings: int | None = 1
    difficulty: Literal["easy", "medium", "hard"] | str | None = "medium"
    cuisine: str | None = ""
    tags: list[str] = Field(default_factory=list)


class RecipeOut(RecipeIn):
    id: int
    created_at: str
    updated_at: str


class RecipeList(BaseModel):
    recipes: list[RecipeOut]
    total: int
    page: int
    size: int


class GenerateRequest(BaseModel):
    ingredients: list[str] = Field(min_length=1)


class GenerateResponse(BaseModel):
    recipes: list[dict]
    source: str


class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 20
    min_score: float = 0.0


def _clean_terms(value: str) -> set[str]:
    return {term for term in re.findall(r"[a-zA-ZåäöÅÄÖ]{3,}", value.lower())}


def _recipe_text(recipe: dict) -> str:
    return " ".join(
        [
            recipe.get("title") or "",
            recipe.get("description") or "",
            " ".join(recipe.get("ingredients") or []),
            recipe.get("instructions") or "",
            recipe.get("cuisine") or "",
            " ".join(recipe.get("tags") or []),
        ]
    )


def _normalise_generated_recipe(recipe: dict, fallback_ingredients: list[str], seed: int = 1) -> dict:
    name = recipe.get("name") or recipe.get("title") or "Ingredient Skillet"
    ingredients = recipe.get("ingredients") or fallback_ingredients
    instructions = recipe.get("instructions") or []
    if isinstance(instructions, str):
        instructions = [step.strip() for step in instructions.split("\n") if step.strip()]

    normalised = {
        "name": name,
        "prepTime": str(recipe.get("prepTime") or recipe.get("prep_time") or "10 min"),
        "cookTime": str(recipe.get("cookTime") or recipe.get("cook_time") or "20 min"),
        "difficulty": str(recipe.get("difficulty") or "medium").lower(),
        "servings": int(recipe.get("servings") or 2),
        "ingredients": ingredients,
        "instructions": instructions,
        "imageUrl": "",
    }
    normalised["imageUrl"] = normalised["imageUrl"] or _image_url_for_recipe(normalised, seed)
    return normalised


def _image_url_for_recipe(recipe: dict, seed: int = 1) -> str:
    prompt = (
        "photorealistic plated food photography, natural light, "
        f"{recipe.get('name', 'home cooked recipe')}, ingredients: "
        f"{', '.join(recipe.get('ingredients') or [])}"
    )
    encoded = quote(prompt)
    return f"https://image.pollinations.ai/prompt/{encoded}?model=flux&width=1024&height=768&nologo=true&safe=true&seed={seed}"


def _normalise_recipes(recipes: list[dict], ingredients: list[str]) -> list[dict]:
    normalised = [
        _normalise_generated_recipe(recipe, ingredients, index + 1)
        for index, recipe in enumerate(recipes)
    ]
    return [*normalised, *_fallback_recipes(ingredients)][:2]


def _fallback_recipes(ingredients: list[str]) -> list[dict]:
    ingredient_text = ", ".join(ingredients)
    main = ingredients[0].strip().title()
    return [
        {
            "name": f"{main} Weeknight Bowl",
            "prepTime": "10 min",
            "cookTime": "18 min",
            "difficulty": "easy",
            "servings": 2,
            "ingredients": ingredients + ["olive oil", "salt", "black pepper"],
            "instructions": [
                f"Prepare {ingredient_text} by chopping everything into bite-sized pieces.",
                "Heat a pan with olive oil and cook the firm ingredients first.",
                "Add the remaining ingredients and season with salt and pepper.",
                "Serve warm in bowls with any sauce, herbs, or leftovers you like.",
            ],
            "imageUrl": _image_url_for_recipe(
                {"name": f"{main} Weeknight Bowl", "ingredients": ingredients}, 101
            ),
        },
        {
            "name": f"Roasted {main} Tray",
            "prepTime": "12 min",
            "cookTime": "25 min",
            "difficulty": "medium",
            "servings": 3,
            "ingredients": ingredients + ["garlic", "lemon juice", "dried herbs"],
            "instructions": [
                "Preheat the oven to 220 C.",
                "Toss the ingredients with garlic, lemon juice, herbs, salt, and oil.",
                "Roast on a tray until browned and cooked through.",
                "Taste, adjust seasoning, and serve with bread, rice, or salad.",
            ],
            "imageUrl": _image_url_for_recipe(
                {"name": f"Roasted {main} Tray", "ingredients": ingredients}, 202
            ),
        },
    ]


def _call_openai(ingredients: list[str]) -> list[dict]:
    prompt = (
        "Create 2 practical recipes from these ingredients: "
        f"{', '.join(ingredients)}. Return only JSON with this shape: "
        '{"recipes":[{"name":"...","prepTime":"10 min","cookTime":"20 min",'
        '"difficulty":"easy","servings":2,"ingredients":["..."],'
        '"instructions":["step 1","step 2"]}]}'
    )
    body = json.dumps(
        {
            "model": settings.openai_model,
            "input": prompt,
            "max_output_tokens": 1200,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=body,
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))

    text_parts: list[str] = []
    for output in data.get("output", []):
        for content in output.get("content", []):
            if content.get("type") == "output_text":
                text_parts.append(content.get("text", ""))

    parsed = json.loads("".join(text_parts))
    return parsed.get("recipes", [])


def _call_free_ai(ingredients: list[str]) -> list[dict]:
    prompt = (
        "Create 2 practical recipes from these ingredients: "
        f"{', '.join(ingredients)}. Return only valid JSON, no markdown, with this shape: "
        '{"recipes":[{"name":"...","prepTime":"10 min","cookTime":"20 min",'
        '"difficulty":"easy","servings":2,"ingredients":["..."],'
        '"instructions":["step 1","step 2"]}]}'
    )
    url = f"https://text.pollinations.ai/{quote(prompt)}"
    with urllib.request.urlopen(url, timeout=30) as response:
        raw = response.read().decode("utf-8")
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    parsed = json.loads(cleaned)
    return parsed.get("recipes", [])


@router.post("/generate", response_model=GenerateResponse)
def generate_recipes(payload: GenerateRequest, request: Request):
    ingredients = [item.strip() for item in payload.ingredients if item.strip()]
    if not ingredients:
        raise HTTPException(status_code=400, detail="At least one ingredient is required")

    client_id = request.client.host if request.client else "unknown"
    if settings.one_generation_per_client and client_id in GENERATED_CLIENTS:
        raise HTTPException(status_code=429, detail="This showcase allows one AI generation per client.")

    if settings.openai_api_key:
        try:
            recipes = _normalise_recipes(_call_openai(ingredients), ingredients)
            GENERATED_CLIENTS.add(client_id)
            return {"recipes": recipes, "source": "openai"}
        except (urllib.error.URLError, TimeoutError, ValueError, KeyError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=502, detail=f"AI generation failed: {exc}") from exc

    if settings.free_ai_enabled:
        try:
            recipes = _normalise_recipes(_call_free_ai(ingredients), ingredients)
            GENERATED_CLIENTS.add(client_id)
            return {"recipes": recipes, "source": "pollinations"}
        except (urllib.error.URLError, TimeoutError, ValueError, KeyError, json.JSONDecodeError):
            pass

    GENERATED_CLIENTS.add(client_id)
    return {"recipes": _fallback_recipes(ingredients), "source": "demo"}


@router.post("/", response_model=RecipeOut)
def create_recipe(recipe: RecipeIn, db: Connection = Depends(get_db)):
    cursor = db.execute(
        """
        INSERT INTO recipes (
            title, description, ingredients, instructions, prep_time, cook_time,
            servings, difficulty, cuisine, tags
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            recipe.title,
            recipe.description or "",
            json.dumps(recipe.ingredients),
            recipe.instructions,
            recipe.prep_time,
            recipe.cook_time,
            recipe.servings or 1,
            recipe.difficulty or "medium",
            recipe.cuisine or "",
            json.dumps(recipe.tags),
        ),
    )
    db.commit()
    row = db.execute("SELECT * FROM recipes WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return row_to_recipe(row)


@router.get("/", response_model=RecipeList)
def list_recipes(
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    cuisine: str | None = None,
    difficulty: str | None = None,
    db: Connection = Depends(get_db),
):
    clauses: list[str] = []
    params: list[str] = []
    if search:
        clauses.append("(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(ingredients) LIKE ?)")
        like = f"%{search.lower()}%"
        params.extend([like, like, like])
    if cuisine:
        clauses.append("LOWER(cuisine) = ?")
        params.append(cuisine.lower())
    if difficulty:
        clauses.append("LOWER(difficulty) = ?")
        params.append(difficulty.lower())

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    total = db.execute(f"SELECT COUNT(*) AS count FROM recipes {where}", params).fetchone()["count"]
    offset = max(page - 1, 0) * size
    rows = db.execute(
        f"SELECT * FROM recipes {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [size, offset],
    ).fetchall()
    return {"recipes": [row_to_recipe(row) for row in rows], "total": total, "page": page, "size": size}


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, db: Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return row_to_recipe(row)


@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(recipe_id: int, recipe: RecipeIn, db: Connection = Depends(get_db)):
    db.execute(
        """
        UPDATE recipes
        SET title = ?, description = ?, ingredients = ?, instructions = ?, prep_time = ?,
            cook_time = ?, servings = ?, difficulty = ?, cuisine = ?, tags = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            recipe.title,
            recipe.description or "",
            json.dumps(recipe.ingredients),
            recipe.instructions,
            recipe.prep_time,
            recipe.cook_time,
            recipe.servings or 1,
            recipe.difficulty or "medium",
            recipe.cuisine or "",
            json.dumps(recipe.tags),
            recipe_id,
        ),
    )
    db.commit()
    return get_recipe(recipe_id, db)


@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Connection = Depends(get_db)):
    cursor = db.execute("DELETE FROM recipes WHERE id = ?", (recipe_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"ok": True}


@router.post("/search/semantic", response_model=list[RecipeOut])
def semantic_search(payload: SemanticSearchRequest, db: Connection = Depends(get_db)):
    query_terms = _clean_terms(payload.query)
    if not query_terms:
        return []

    rows = db.execute("SELECT * FROM recipes ORDER BY created_at DESC").fetchall()
    scored: list[tuple[float, dict]] = []
    for row in rows:
        recipe = row_to_recipe(row)
        recipe_terms = _clean_terms(_recipe_text(recipe))
        score = len(query_terms & recipe_terms) / max(len(query_terms), 1)
        if score >= payload.min_score:
            scored.append((score, recipe))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [recipe for _, recipe in scored[: payload.limit]]
