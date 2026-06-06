# Clapr — Final User Flow


## 0. Dashboard
User lands on dashboard. Projects shown as cards with:
- Project name, script title, date
- Timeline strip (shots generated / marked done / exported)
- Resume or Open

**CTA:** New Project

---

## 1. New Project Setup
Single form, one page:

- **Project name**
- **Script** — paste or upload (.pdf, .fountain, .txt, .docx)
- **Total time limit** — optional, AI will distribute duration across shots
- **Platform(s)** — multi-select with AI suggestion badge based on script tone/style
- **Reference map** — if any selected platform uses ref IDs, user defines here: `Character → @ref_id`. Can be skipped and added later.
- **Extra notes** — style direction, mood, restrictions
- **Confirmations** — toggles: skip storyboard confirmation / skip scene confirmation

**CTA:** Generate →

---

## 2. Storyboard *(skippable)*
AI generates one frame description + mood + estimated duration per story beat.

User can:
- Confirm as-is
- Edit a beat manually
- Select a beat and prompt AI to refine it
- Reorder beats

**CTA:** Confirm Storyboard →

---

## 3. Scene Breakdown *(skippable)*
AI splits into scenes with:
- Scene title, location, time of day
- Description
- Estimated shot count and duration

User can:
- Confirm
- Edit scene manually
- Prompt AI to merge, split, or rewrite a scene

**CTA:** Confirm Scenes →

---

## 4. Shot Generation
AI generates all shots. Each shot card shows:

```
[Shot 04]  Medium Close-Up · Dolly in · ~4s
Model: Kling 3.0 ★  [override ▾]
Refs: @arjun_ref_01
First Frame Prompt: [if required by model]
Final Prompt: [formatted, cap-enforced]
[Copy]  [Regen]  [Edit]  [Mark Done]
```

User can:
- Override model per shot
- Edit reference bindings
- Regenerate first frame prompt independently
- Edit final prompt manually
- Regen individual shot without touching others
- Prompt AI to refine a specific shot

**CTA:** Save Project →

---

## 5. Project Saved
Lands back on dashboard. Project card appears with timeline strip at 0% done. User resumes anytime.

---

## 6. Execution & Tracking
User runs prompts in Kling / Veo / Higgsfield externally. Comes back to Clapr and marks shots as **Done** manually. Timeline strip fills up per shot marked.

Optional: attach a note or clip link per shot.

---

## 7. Export
At any point:
- **Copy** individual shot prompt
- **Bulk export** — JSON, CSV, or plain text
- Filter export by model, scene, or status
- Export first frame prompts separately if needed

---

## 8. Project Completion
All shots marked done → project shows 100% on dashboard. Option to archive or duplicate as a new project template.

---