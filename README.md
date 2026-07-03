# AI Recipe Generator

An AI-assisted recipe generator built as part of a school course about modern AI tools and AI-powered applications.

The project started with a vibe-coded frontend, then we explored how to connect it to our own Python backend. This showcase version is focused on the frontend experience, so it can run without a local backend. The Python backend code is still included in the repository for review.

## Showcase Version

In the current showcase setup:

- The frontend runs as a standalone Vite/React app.
- Users enter ingredients and generate recipe ideas.
- The app generates recipe cards with AI-style food images.
- If the Python backend is not running, the frontend uses a free browser-side fallback.
- Backend code is included to show the intended Python/FastAPI structure.

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-inspired components
- Lucide React icons
- Python
- FastAPI
- SQLite
- Pollinations AI fallback for text/image generation
- Optional OpenAI API integration in the backend

## Project Structure

```text
src/        Frontend application
backend/    Python/FastAPI backend code
public/     Static assets
supabase/   Legacy Supabase config from the earlier prototype
```

## Running the Showcase

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Backend Note

The backend was written in Python to explore building and owning the AI flow ourselves instead of relying only on generated frontend code or external project backends.

For this GitHub showcase, the frontend is the main runnable part. The backend code remains available in `backend/` for anyone who wants to inspect the FastAPI implementation.
