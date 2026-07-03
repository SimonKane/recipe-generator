.PHONY: install dev prod clean test lint format check-format type-check help

# Default target
help:
	@echo "Available commands:"
	@echo "  install      Install dependencies with Poetry"
	@echo "  dev          Start development server with hot reload"
	@echo "  prod         Start production server"
	@echo "  clean        Clean up cache and temporary files"
	@echo "  test         Run tests"
	@echo "  lint         Run linting (flake8)"
	@echo "  format       Format code (black + isort)"
	@echo "  check-format Check code formatting"
	@echo "  type-check   Run type checking (mypy)"
	@echo "  db-init      Initialize database tables"
	@echo "  db-migrate   Run database migrations"
	@echo ""
	@echo "Quick start:"
	@echo "  make install  # Install dependencies"
	@echo "  make dev      # Start development server"

# Install dependencies
install:
	@echo "📦 Installing dependencies with Poetry..."
	poetry install

# Development server
dev:
	@echo "🚀 Starting development server..."
	poetry run python run.py

# Production server
prod:
	@echo "🏭 Starting production server..."
	poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

# Run tests
test:
	@echo "🧪 Running tests..."
	poetry run pytest -v

# Linting
lint:
	@echo "🔍 Running linting..."
	poetry run flake8 app/

# Format code
format:
	@echo "✨ Formatting code..."
	poetry run black app/
	poetry run isort app/

# Check formatting
check-format:
	@echo "🔍 Checking code formatting..."
	poetry run black --check app/
	poetry run isort --check-only app/

# Type checking
type-check:
	@echo "🔍 Running type checks..."
	poetry run mypy app/

# Database initialization
db-init:
	@echo "🗃️ Initializing database..."
	poetry run python create_db.py

# Database migrations (if using Alembic)
db-migrate:
	@echo "🔄 Running database migrations..."
	poetry run alembic upgrade head