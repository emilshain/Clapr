# Clapr

## What Is It?

Clapr turns your script into a detailed video production plan. Paste a script → get beats, scenes, and shots with the best AI model picked for each one. Then paste the prompts into Kling, Seedance, or WAN and generate.

## Why Use Clapr Instead of Closed Platforms?

| Problem | Closed Platform | Clapr |
|---------|---|---|
| **New model drops?** | Start over from scratch | Works with any model — paste the same plan into the new tool tomorrow |
| **Want to test ideas?** | Pay render money every time | Re-roll the plan 100 times for pennies; only pay for approved shots |
| **Need human actors too?** | Forces all-AI output | Same plan works for AI, humans, and designers mixed together |
| **Characters look weird mid-video?** | System loses track during generation | Full structure locked before rendering starts; character IDs consistent everywhere |

## Features

- Paste script → get complete shot plan in 30 seconds
- Picks the right video model per shot (Kling for action, Seedance for style, WAN for realism)
- Auto-generates character reference IDs that work across all shots
- Respects each model's rules (Seedance only takes 4/5/6/8/10/12/15 seconds, etc.)
- Export as JSON/CSV/text; works with any tool

## Tech

- Frontend: React + TypeScript
- Backend: Python + FastAPI  
- AI: OpenAI API (GPT-4o-mini)
- Cost: Pennies for planning, dollars for rendering (not thousands)

## Start Here

```bash
git clone https://github.com/emilshain/Clapr.git
cd Clapr/backend
export OPENAI_API_KEY=sk-...
uvicorn app.main:app --port 8000

# In another terminal:
cd Clapr/frontend
npm install && npm run dev
```

## Deploy

**[See DEPLOY.md for full instructions](./DEPLOY.md)**

Quick start (Vercel):
```bash
git push origin main
# Go to vercel.com → import repo → add OPENAI_API_KEY env var → deploy
```

3 options:
- **Vercel only** (easiest, recommended)
- **Vercel + Railway** (frontend + backend separate)
- **Manual** (Render, Fly.io, or custom)

## The Pitch

You don't need a $20K/month AI video platform. You need a $0.10 planner and a $1 renderer. Clapr is the planner. It never gets outdated because it doesn't care which renderer you use.
