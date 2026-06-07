# Clapr — The AI Video Planner

## The Problem

You have a script. You paste it into Kling or Sora. One minute later, you have a video. But it looks like garbage.

Why? Because you just let the AI guess. You didn't tell it:
- Which shots need action vs. style vs. realism
- Which model is actually best for each moment
- What your character should look like in shot 3, 7, and 12
- How long each shot can be (Seedance only takes 4/5/6/8/10/12/15 seconds — not 7)

So you spend $100 in render credits finding out the hard way.

## The Solution

Clapr is your director before rendering starts.

**You paste the script. Clapr gives you:**
- Every shot broken down
- The best AI model picked for each one (Kling for action, Seedance for mood, WAN for realism)
- Perfect prompts ready to paste into any tool
- Character IDs that stay the same across every shot
- Respect for each model's weird rules

**Now you have a plan.** You test it once. You tweak it. You run it 100 times for $1. Only when it's perfect do you spend render money.

## Why People Buy It

| You Want | Expensive Platform | Clapr |
|---|---|---|
| **New model drops** | Locked in. Start over. | Works with any model. Tomorrow. |
| **Test lots of ideas** | $100 per test | $0.01 per test |
| **Human actors + AI** | Breaks. All-AI only. | Use both. Same plan. |
| **Consistent characters** | Characters morph. | IDs locked before rendering. |

## How It Works

1. Paste your script
2. Get beats, scenes, shots, and reference IDs in 30 seconds
3. Review and tweak (optional)
4. Copy any prompt, paste into Kling/Seedance/WAN
5. Generate

## Get Started

```bash
git clone https://github.com/emilshain/Clapr.git
cd Clapr/backend
export OPENAI_API_KEY=sk-...
uvicorn app.main:app --port 8000

# New terminal:
cd Clapr/frontend
npm install && npm run dev
```

Visit `http://localhost:5173`

## Demo Script

Show these four wins:

**1. Model Obsolescence Immunity** (30 sec)
- Paste a script
- Get a shot plan with Kling, Seedance, and WAN prompts
- "Tomorrow, a better model drops. Just copy these prompts in. Same plan works."
- Show export → paste into different tool

**2. Cost Before Committing** (45 sec)
- Show the Setup form with a script
- Hit Continue → show the LLM generating a full plan in 10 seconds
- "That cost 1 cent. You can do that 100 times for a dollar."
- Show beat/scene/shot edits (tweaking the plan)
- "Only when you approve the plan do you spend money on renders."

**3. Hybrid Flexibility** (30 sec)
- Show the shot list with mixed models
- "Shot 1–3 go to Kling (our AI). Shot 4 goes to a human actor on set. Shot 5 is motion graphics."
- "One plan. AI, humans, designers. All from the same brief."

**4. Structural Continuity** (45 sec)
- Show the Reference Map page with character IDs (@lead_ref_01, etc.)
- "Every shot uses the same reference. Character never morphs. You locked it before rendering."
- Show a shot prompt that uses @lead_ref_01
- Show another shot using the same @lead_ref_01
- "Same character, every time. Structure locked before the first pixel is born."

**Close (30 sec)**
- Show the export panel (JSON/CSV)
- One-liner: "You don't need a $20K/month platform. You need a $0.10 planner and a $1 renderer. We're the planner. We never get outdated."

## The Math

- **Closed platform:** $200/mo subscription + $50/video in render costs
- **Clapr:** Free to host + $0.10 planning cost + $1 rendering cost (any tool)

**= You save $200/mo and move faster**

---

**You don't need a $20K/month supercomputer. You need a 10¢ planner and a $1 renderer. We're the planner. We never get outdated because we don't care which renderer you use.**
