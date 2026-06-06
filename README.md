# Clapr

Clapr is a small full-stack starter with a FastAPI backend and a React frontend.

## Layout

- `backend/` FastAPI app with a chat endpoint powered by the `OPENAI_API_KEY` environment variable.
- `frontend/` Vite + React app that talks to the backend.

## Backend setup

1. Create and activate a Python virtual environment in `backend/`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Set `OPENAI_API_KEY` in your shell before starting the server.
4. Run `uvicorn app.main:app --reload --port 8000` from the `backend/` folder.

Optional environment variables:

- `OPENAI_MODEL` defaults to `gpt-4o-mini`.
- `FRONTEND_ORIGIN` defaults to `http://localhost:5173`.

## Frontend setup

1. Run `npm install` in `frontend/`.
2. Start the app with `npm run dev`.

The frontend uses `VITE_BACKEND_URL` if it is set, and otherwise falls back to `http://localhost:8000`.
