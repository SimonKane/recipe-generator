import json
import sqlite3
from pathlib import Path

from app.config import settings

def _sqlite_path() -> Path:
    if settings.database_url.startswith("sqlite:///"):
        return Path(settings.database_url.replace("sqlite:///", "", 1)).resolve()
    return Path("food_recipes.db").resolve()

DB_PATH = _sqlite_path()

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                ingredients TEXT NOT NULL,
                instructions TEXT NOT NULL,
                prep_time INTEGER,
                cook_time INTEGER,
                servings INTEGER DEFAULT 1,
                difficulty TEXT DEFAULT 'medium',
                cuisine TEXT DEFAULT '',
                tags TEXT DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()

def row_to_recipe(row: sqlite3.Row) -> dict:
    recipe = dict(row)
    recipe["ingredients"] = json.loads(recipe["ingredients"] or "[]")
    recipe["tags"] = json.loads(recipe["tags"] or "[]")
    return recipe

def get_db():
    db = get_connection()
    try:
        yield db
    finally:
        db.close()
