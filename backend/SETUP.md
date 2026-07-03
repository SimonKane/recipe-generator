# Quick Setup Guide - Poetry Installation & Usage

## 1. Install Poetry (if not already installed)

### Windows (PowerShell):
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

### Linux/macOS:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

### Alternative (pip):
```bash
pip install poetry
```

After installation, restart your terminal or run:
```bash
# Windows
$env:PATH += ";$env:APPDATA\Python\Scripts"

# Linux/macOS  
export PATH="$HOME/.local/bin:$PATH"
```

## 2. Setup Backend with Poetry

```bash
cd backend

# Install all dependencies (creates virtual environment automatically)
poetry install

# Activate the virtual environment (optional, poetry run handles this)
poetry shell

# Setup environment variables
cp .env.example .env
# Edit .env file with your database settings

# Start development server
poetry run python run.py

# Or use the development script
.\dev.ps1 dev        # Windows
make dev             # Linux/macOS
```

## 3. Verify Installation

Open browser and check:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## 4. Common Commands

```bash
# Add new dependency
poetry add package-name

# Add development dependency  
poetry add --group dev package-name

# Remove dependency
poetry remove package-name

# Update dependencies
poetry update

# Show installed packages
poetry show

# Run any command in the poetry environment
poetry run python -c "import fastapi; print('FastAPI installed!')"

# Export requirements.txt (for Docker/deployment)
poetry export -f requirements.txt --output requirements.txt
```

## 5. Development Workflow

```bash
# 1. Install dependencies
poetry install

# 2. Start development server with hot reload
poetry run python run.py

# 3. In another terminal, run tests
poetry run pytest

# 4. Format and lint code
poetry run black app/
poetry run isort app/
poetry run flake8 app/

# 5. Type checking
poetry run mypy app/
```

## Troubleshooting

**Poetry not found after installation:**
- Restart terminal
- Check PATH contains Poetry's bin directory

**Virtual environment issues:**
```bash
# Remove existing env and recreate
poetry env remove python
poetry install
```

**Dependencies not installing:**
```bash
# Clear cache and reinstall
poetry cache clear pypi --all
poetry install
```