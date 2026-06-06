# Clapr

## Overview

Clapr is an **Agentic Video Planner** — a Creative AI Orchestrator that turns raw scripts into complete, production-ready shot plans. It uses an LLM to break down your script into narrative beats, scenes, and individual shots, then selects the optimal AI video model for each shot and writes a production-quality generation prompt ready to paste into Kling, Seedance, WAN, or any other video model.

Clapr does not render pixels. It is the director's brain.

---

## Problem Statement

Creating AI-generated video at a professional level requires more than typing a prompt. A 60-second film may need 12–20 individual shots, each requiring:

- The right video model — not all models handle motion, audio, or style the same way
- A carefully crafted prompt written in that model's specific syntax
- Character reference IDs that stay consistent across every shot
- A duration that fits the model's hard constraints (Seedance only accepts fixed values; Kling caps at 15s)
- A coherent narrative structure across the whole piece

Doing this manually is slow, inconsistent, and wastes expensive cloud render credits on poorly planned shots. Closed-loop platforms lock you into their model stack — if a better model drops tomorrow, you start over from scratch.

---

## Solution

Clapr separates **planning** from **rendering**. You paste a script once. Clapr's LLM-powered pipeline:

1. Extracts the narrative structure into **beats** (acts)
2. Breaks the story into **scenes** by location and setup
3. Generates every **shot** with model selection, motion direction, duration, reference tokens, and a production-quality prompt
4. Builds a **reference map** — character IDs, props, and locations — automatically from the script
5. Outputs everything as a portable plan you can execute in any tool or hand to a human crew

Because Clapr outputs text blueprints rather than rendered frames, you can re-roll the entire plan 100 times for pennies — and only spend render budget once the plan is approved.

---

## Features

- **Script-to-shot breakdown** — paste any script and receive beats, scenes, and shots in one LLM call; the entire production plan is generated before a single pixel is rendered
- **AI model selection per shot** — LLM applies a decision tree to each shot: audio-critical → Seedance; explicit/NSFW → WAN; complex action or English dialogue → Kling; avoids the one-size-fits-all problem of closed platforms
- **Model-specific prompt generation** — prompts are written in the exact style each model performs best with: cinematic DoP language for Kling, audio-first descriptions for Seedance, documentary grounding for WAN; a curated 21K-token examples library is injected as in-context reference at generation time
- **Automatic reference map** — LLM identifies recurring characters, props, and locations in the script and assigns consistent `@ref_id` tokens used across every shot prompt
- **Soul ID integration** — maps character reference images to Higgsfield Soul IDs for face consistency; the `@ref_id → soul_id` mapping is auto-populated in the reference map
- **Duration budget management** — respects per-model hard limits; Seedance durations are automatically snapped to valid API values (4/5/6/8/10/12/15s); total time limit distributes duration across shots proportionally
- **Multi-shot grouping** — adjacent same-model shots within a scene are grouped for Kling's multi-shot storyboard mode, reducing API calls and improving temporal consistency
- **Shot status tracking** — mark shots todo/done as you generate and approve clips; progress synced to project cards
- **Per-shot prompt refinement via LLM** — refine any shot prompt with a one-line director instruction; model re-selection happens automatically if the instruction changes the shot type
- **Reference image prompt generation** — generates Soul Cinema prompts for every character and Gemini Pro prompts for every location and prop in the reference map, with individual and sheet-style output
- **Model-agnostic export** — export the full shot plan as JSON, CSV, or plain text; paste into Kling, Seedance, WAN, Sora, or hand to a human crew
- **Storyboard and scene editor** — review and edit auto-generated beats and scenes before committing to shots; merge, split, or rewrite scenes inline
- **Skip steps** — bypass storyboard or scene confirmation to go straight to shots for fast iteration workflows
- **One-click prompt copy** — copy any shot prompt to clipboard for direct paste into any generation tool

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** None — stateless; all project state is held client-side in the browser
- **APIs:** OpenAI API (GPT-4o-mini) for script analysis, model selection, and prompt generation
- **Hosting:** Frontend — Vercel / Netlify; Backend — Railway / Render / Fly.io

---

## Codex / OpenAI Usage

OpenAI's API powers the core intelligence of Clapr at multiple layers:

- **Script analysis and shot generation** — `POST /api/script/parse` sends the full script to GPT-4o-mini with a ~8,000-token system prompt containing model selection rules, duration constraints, referencing syntax, and a curated library of real-world prompt examples; the model returns a structured JSON breakdown of beats, scenes, shots, and a reference map in a single call
- **Automated model selection** — the LLM applies a decision tree embedded in the system prompt to pick the right model per shot (Kling vs Seedance vs WAN) based on motion type, audio requirements, content sensitivity, and referencing method
- **Production prompt generation** — GPT writes each shot prompt in the style appropriate for the chosen model, using in-context examples as a style guide
- **Reference map construction** — GPT identifies recurring characters and locations in the script and assigns consistent `@ref_id` tokens used across every shot
- **Shot prompt refinement** — `POST /api/chat` handles per-shot rewrites based on a one-line director instruction, including automatic model re-selection when the instruction changes the shot type
- **Reference image prompting** — the same chat endpoint generates Soul Cinema and Gemini Pro prompts for each character, prop, and location, and re-selects the image model based on subject type
- **Architecture planning** — used to design the agentic pipeline, system prompt structure, model decision logic, and Seedance duration snap rules
- **Debugging** — used throughout development to diagnose `.format()` template clashes with JSON braces, Pydantic schema mismatches, and duration validation edge cases

---

## Demo

_Add your demo or pitch video link here._

---

## Screenshots

_Add screenshots of your project here._

---

## How to Run Locally

```bash
git clone <repo-url>
cd clapr
```

**Backend**

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (or export to your shell):

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
FRONTEND_ORIGIN=http://localhost:5173
```

```bash
uvicorn app.main:app --port 8000 --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The frontend reads `VITE_BACKEND_URL` if set, otherwise defaults to `http://localhost:8000`.

---

## Why an Orchestrator Beats a Closed-Loop Renderer

| | Clapr (Orchestrator) | Closed-loop platform |
|---|---|---|
| **Model obsolescence** | Model-agnostic — paste prompts into any new model the day it ships | Locked to integrated model stack; re-integration required for each new model |
| **Cost before committing** | Re-roll the full 20-shot plan 100× for pennies; render budget spent only on approved shots | Pay cloud GPU compute on every failed generation attempt |
| **Hybrid workflows** | Unified plan works for AI tools, human videographers, and motion designers simultaneously | Forces all-AI output; breaks on mixed-crew productions |
| **Narrative continuity** — | Full structure mapped before a single pixel is born; character tokens and pacing locked globally | Frame-by-frame generation loses the big picture; characters drift mid-scene |
| **Prompt quality** | Each prompt written in model-specific syntax with production examples as in-context reference | Generic prompts, one style fits all models |
