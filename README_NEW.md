# Food Recipe Generator with AI

A modern web application that combines AI-powered recipe generation with semantic search capabilities. This project demonstrates the use of multiple AI technologies including LLMs for recipe generation and vector embeddings for intelligent recipe search.

## 🚀 Features

### Frontend (React + TypeScript)
- **Recipe Generation**: Generate custom recipes based on available ingredients using AI
- **Recipe Management**: Save, view, and organize your favorite recipes
- **Semantic Search**: Find recipes using natural language queries
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

### Backend (Python + FastAPI)
- **RESTful API**: Complete CRUD operations for recipe management
- **Semantic Search**: AI-powered recipe search using sentence transformers
- **Vector Embeddings**: Automatic embedding generation for semantic similarity
- **PostgreSQL Database**: Robust data storage with JSON support
- **Docker Support**: Easy deployment with containerization

## 🧠 AI Technologies Used

1. **Large Language Models (LLMs)**: For generating creative and contextual recipes
2. **Sentence Transformers**: For semantic search using the `all-MiniLM-L6-v2` model
3. **Vector Embeddings**: For similarity-based recipe recommendations
4. **Natural Language Processing**: For understanding search queries and recipe content

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Tanstack Query** for API state management

### Backend  
- **FastAPI** (Python) for REST API
- **PostgreSQL** for database
- **SQLAlchemy** for ORM
- **Sentence Transformers** for embeddings
- **Pydantic** for data validation
- **Docker & Docker Compose** for containerization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL 12+ or Docker
- Git

### Option 1: Using Docker (Recommended)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd food-idea-generator
```

2. **Start the backend services**:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration if needed
docker-compose up -d
```

3. **Set up the frontend**:
```bash
cd ../
cp .env.example .env
# Edit .env to set VITE_BACKEND_URL=http://localhost:8000
npm install
npm run dev
```

4. **Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database Admin: http://localhost:8080

### Option 2: Manual Setup

1. **Backend Setup**:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure your PostgreSQL database in .env
python create_db.py  # Create database tables
python run.py  # Start the server
```

2. **Frontend Setup**:
```bash
npm install
cp .env.example .env
# Set VITE_BACKEND_URL=http://localhost:8000
npm run dev
```

## 📖 Usage

### Generate Recipes
1. Navigate to the home page
2. Enter available ingredients
3. Click "Generate Recipes" to get AI-generated suggestions
4. Save recipes you like to your collection

### Manage Saved Recipes
1. Go to "Saved Recipes" page
2. Browse your saved recipes
3. Use filters to find specific cuisines or difficulty levels
4. Use semantic search to find recipes with natural language

### Semantic Search Examples
- "healthy breakfast with protein"
- "quick dinner for kids"
- "vegetarian comfort food"
- "spicy asian noodles"

## 🤖 AI Integration & Reflection

### Which AI Technologies Were Identified and Applied?

1. **Sentence Transformers (all-MiniLM-L6-v2)**
   - **Application**: Converting recipe text into vector embeddings for semantic search
   - **Implementation**: Every saved recipe generates a 384-dimensional embedding stored in the database
   - **Use Case**: Enables natural language search like "healthy breakfast" to find relevant recipes

2. **Large Language Models via Supabase Edge Functions**
   - **Application**: Generating creative recipes based on available ingredients
   - **Implementation**: Existing integration for recipe generation
   - **Use Case**: Creates detailed recipes with ingredients, instructions, and metadata

### Why These AI Technologies?

**Sentence Transformers:**
- **Lightweight**: The MiniLM model is fast and efficient for real-time search
- **Multilingual**: Supports multiple languages for international recipes
- **Proven**: Well-established for semantic similarity tasks
- **Local Processing**: Can run locally without API costs for embeddings

**Vector-based Semantic Search:**
- **Superior User Experience**: Users can search naturally instead of exact keyword matching
- **Context Understanding**: Finds recipes based on meaning, not just word matches
- **Scalable**: Efficient similarity computation with large recipe databases

### Was AI Necessary? Alternative Solutions?

**AI was essential for:**
1. **Semantic Search**: Traditional keyword search would miss contextually similar recipes
2. **Recipe Generation**: Creating diverse, contextual recipes based on ingredients

**Alternative approaches considered:**
1. **Full-text search**: Limited to exact word matches, poor user experience
2. **Tag-based filtering**: Requires manual categorization, less flexible
3. **Manual recipe curation**: Not scalable, limited variety

**Why AI is superior:**
- **Natural Language Interface**: Users think in concepts, not keywords
- **Contextual Understanding**: "healthy breakfast" matches recipes without those exact words
- **Continuous Learning**: Embedding models improve with more data
- **User Intent**: Captures what users really want, not just what they type

### Technical Implementation Insights

**Challenges Encountered:**
1. **Embedding Storage**: PostgreSQL JSON fields for vector storage worked well
2. **Performance**: Cosine similarity computation scales with dataset size
3. **Model Selection**: Balanced accuracy vs. speed with MiniLM model

**Solutions Applied:**
1. **Async Processing**: Non-blocking embedding generation
2. **Caching Strategy**: Store embeddings to avoid recomputation  
3. **Similarity Thresholds**: Configurable minimum scores for relevant results

## 🔧 API Endpoints

### Recipes
- `POST /api/v1/recipes/` - Create recipe
- `GET /api/v1/recipes/` - List recipes (with filtering)
- `GET /api/v1/recipes/{id}` - Get specific recipe
- `PUT /api/v1/recipes/{id}` - Update recipe
- `DELETE /api/v1/recipes/{id}` - Delete recipe
- `POST /api/v1/recipes/search/semantic` - Semantic search

### Health & Status
- `GET /` - API status
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 🎯 Future Enhancements

1. **Advanced AI Features**:
   - Recipe recommendation based on user preferences
   - Nutritional analysis using AI
   - Ingredient substitution suggestions
   - Image generation for recipes

2. **Enhanced Search**:
   - Multi-modal search (text + images)
   - Dietary restriction filtering with AI
   - Seasonal recipe recommendations

3. **User Experience**:
   - User accounts and personalization
   - Recipe rating and reviews
   - Social sharing features
   - Mobile app development

## 🤝 Development with AI Assistance

This project was developed with significant AI assistance using:
- **GitHub Copilot**: Code completion and suggestions
- **Claude/ChatGPT**: Architecture decisions and problem-solving
- **AI-Generated Documentation**: README and code comments

The AI assistance helped with:
- Rapid prototyping of API endpoints
- Best practices for FastAPI and React integration
- Database schema design
- Error handling patterns
- Component architecture

## 📝 License

This project is created for educational purposes as part of an AI technology course.

---

## Original Assignment Information

AI-baserad webbapplikation
Syfte
Uppgiften går ut på att skapa en tjänst som använder modern AI-teknik på något vis. Med modern AI-teknik menas: Anrop till AI-API:er så som LLMs, embedding-modeller, klassificerings-modeller eller liknande. Ni väljer själva målsättningen med tjänsten, och att utforska detta med AI-stöd är en del av arbetet med uppgiften.

Ta chansen och påbörja arbetet på ett projekt ni varit sugna på att göra länge! Fokus ligger inte endast på att få allting att fungera utan snarare att utforska och se, var går det fel och vad är svårt med AI?