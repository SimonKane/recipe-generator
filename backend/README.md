# Food Recipe Generator Backend

A FastAPI backend service for the Food Recipe Generator application with semantic search capabilities.

## Features

- **Recipe Management**: Full CRUD operations for recipes
- **Semantic Search**: AI-powered recipe search using sentence transformers
- **PostgreSQL Database**: Robust data storage with JSON support for flexible recipe data
- **RESTful API**: Clean, documented API endpoints
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **CORS Enabled**: Ready for frontend integration

## API Endpoints

### Recipes
- `POST /api/v1/recipes/` - Create a new recipe
- `GET /api/v1/recipes/` - Get recipes with pagination and filtering
- `GET /api/v1/recipes/{recipe_id}` - Get a specific recipe
- `PUT /api/v1/recipes/{recipe_id}` - Update a recipe
- `DELETE /api/v1/recipes/{recipe_id}` - Delete a recipe
- `POST /api/v1/recipes/search/semantic` - Semantic search recipes

### Health
- `GET /` - API status
- `GET /health` - Health check

## Quick Start

### Using Docker Compose (Recommended)

1. Copy environment file:
```bash
cp .env.example .env
```

2. Start all services:
```bash
docker-compose up -d
```

3. The API will be available at `http://localhost:8000`
4. Database admin (Adminer) at `http://localhost:8080`

### Manual Setup with Poetry (Recommended)

1. **Prerequisites**:
   - Python 3.11+
   - PostgreSQL 12+
   - [Poetry](https://python-poetry.org/docs/#installation)

2. **Install dependencies**:
```bash
# Using Poetry (recommended)
poetry install

# Or using pip (fallback)
pip install -r requirements.txt
```

3. **Set up environment**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Create database**:
```sql
CREATE DATABASE food_recipes;
```

5. **Initialize database tables**:
```bash
# Using Poetry
poetry run python create_db.py

# Or using development script
./dev.ps1 db-init  # Windows
make db-init       # Linux/macOS
```

6. **Start the development server**:
```bash
# Using Poetry
poetry run python run.py

# Or using development scripts
./dev.ps1 dev      # Windows  
make dev           # Linux/macOS

# Or directly with uvicorn
poetry run uvicorn app.main:app --reload
```

### Development Commands

**Windows (PowerShell):**
```powershell
.\dev.ps1 install     # Install dependencies
.\dev.ps1 dev         # Start development server
.\dev.ps1 test        # Run tests
.\dev.ps1 format      # Format code
.\dev.ps1 lint        # Run linting
.\dev.ps1 clean       # Clean cache files
```

**Linux/macOS (Make):**
```bash
make install          # Install dependencies
make dev              # Start development server
make test             # Run tests
make format           # Format code
make lint             # Run linting
make clean            # Clean cache files
```

**Direct Poetry Commands:**
```bash
poetry install                           # Install dependencies
poetry run python run.py                # Start dev server
poetry run uvicorn app.main:app --reload # Alternative dev server
poetry run pytest                       # Run tests
poetry run black app/                   # Format code
poetry run flake8 app/                  # Lint code
poetry run mypy app/                    # Type checking
```

## Development

### Project Structure
```
backend/
├── app/
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── routers/         # FastAPI routers
│   ├── services/        # Business logic
│   ├── config.py        # Configuration
│   ├── database.py      # Database setup
│   └── main.py          # FastAPI application
├── migrations/          # Database migrations
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
└── run.py             # Application runner
```

### Adding New Endpoints

1. Define schemas in `app/schemas/`
2. Create/update models in `app/models/`
3. Implement business logic in `app/services/`
4. Create router endpoints in `app/routers/`
5. Register router in `app/main.py`

### Semantic Search

The semantic search uses the `all-MiniLM-L6-v2` sentence transformer model to generate embeddings for recipes. When a recipe is created or updated, an embedding is automatically generated and stored in the database for fast similarity searches.

## API Documentation

Once the server is running, visit:
- **Interactive docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/food_recipes` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-here` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:5173` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Production Deployment

1. Set strong `SECRET_KEY` in environment
2. Use production PostgreSQL instance
3. Set appropriate `ALLOWED_ORIGINS` for CORS
4. Use reverse proxy (nginx) for SSL termination
5. Set up monitoring and logging

## License

This project is part of the Food Recipe Generator application.