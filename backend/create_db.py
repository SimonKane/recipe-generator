#!/usr/bin/env python3

import asyncio
import asyncpg
from app.config import settings
from app.models.recipe import Base
from sqlalchemy import create_engine

async def create_database_schema():
    """Create database tables"""
    try:
        # Create engine and tables
        engine = create_engine(settings.database_url)
        Base.metadata.create_all(bind=engine)
        print("Database schema created successfully!")
        
    except Exception as e:
        print(f"Error creating database schema: {e}")

async def main():
    await create_database_schema()

if __name__ == "__main__":
    asyncio.run(main())