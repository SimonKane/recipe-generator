from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create synchronous engine
engine = create_engine(settings.database_url, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Metadata and Base for models
metadata = MetaData()
Base = declarative_base()

# Dependency for getting database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()