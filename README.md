# Clapr

## Overview
Clapr is an Agentic Video Planner — a Creative AI Orchestrator that turns raw scripts into complete, production-ready shot plans, selects the optimal AI video model for each shot, and writes production-quality generation prompts ready to paste into Kling, Seedance, Van, or any other video model.

## Problem Statement
Creating AI-generated video at a professional level requires choosing the right video models, crafting specific prompts, keeping character reference IDs consistent, and managing duration budgets. Doing this manually is slow, inconsistent, and leads to wasted render credits.

## Solution
Clapr separates planning from rendering. It analyzes a script to structure beats, scenes, shots, and reference maps automatically, letting you iterate on the blueprint for pennies before spending render budget on final generations.

## Features
- **Script-to-shot breakdown**: Paste any script and receive narrative beats, scenes, and shots in one LLM call.
- **AI model selection and prompt generation**: Pick the best video model (Kling, Seedance, Van) and generate tailored prompts per shot.
- **Automated reference map & validation**: Auto-suggests character, prop, and location reference IDs from the script and enforces first/last frame prompts for Kling and multishots.

## Tech Stack
- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI
- Database: Stateless (client-side state)
- APIs: OpenAI API (GPT-4o-mini)
- Hosting: Vercel (Frontend), Railway (Backend)

## Codex / OpenAI Usage
- Ideation: Planning the model-agnostic orchestrator concept.
- Architecture planning: Designing the structured JSON output schema and multi-column UI layout.
- Code generation: Implementing the layout grids and prompt refinement inputs.
- Debugging: Resolving Pydantic schema validation errors and React state hook synchronizations.
- API integration: Interfacing the frontend and backend with GPT-4o-mini completions.

## Demo
https://drive.google.com/file/d/1FCu_-dO9O7AIuBQoUL7Mft5H882ec0j5/view?usp=sharing

## Screenshots
https://drive.google.com/drive/folders/169O-I1tc04SliUHygB-E3czaF-lROplv?usp=sharing

## How to Run Locally

```bash
git clone https://github.com/emilshain/Clapr.git
cd Clapr
npm install
npm run dev
```
