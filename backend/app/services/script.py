import json
import os

from app.schemas.script import Beat, Scene, ScriptParseRequest, ScriptParseResponse, Shot
from app.services.chat import _build_client, _load_model_guidelines


def _load_prompt_examples() -> str:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(current_dir, "prompt_examples.txt"),
        os.path.join(current_dir, "..", "prompt_examples.txt"),
        os.path.join(current_dir, "..", "..", "prompt_examples.txt"),
        "prompt_examples.txt",
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return f.read().strip()
            except Exception:
                pass
    return ""

_SYSTEM_PROMPT = """You are a professional cinematic AI director and shot designer for Clapr, an AI video production platform.

Your task: analyze the provided script and break it down into a complete production plan.
Generate PRODUCTION-QUALITY prompts for each shot that follow the best practices and examples below.
Return your response as a single valid JSON object — nothing else.

OUTPUT SCHEMA:
{
  "beats": [
    {
      "id": <integer>,
      "title": "<narrative beat name>",
      "frame": "<one-sentence first-frame visual description>",
      "mood": "<2–4 word mood/tone>",
      "duration": "<Xs>"
    }
  ],
  "scenes": [
    {
      "id": <integer>,
      "title": "<scene name>",
      "location": "<physical location or setting>",
      "time": "<Morning | Day | Evening | Night>",
      "description": "<1–2 sentence production description>",
      "shots": <integer count of shots in this scene>,
      "duration": "<total Xs for scene>"
    }
  ],
  "shots": [
    {
      "id": <integer>,
      "scene": "<must exactly match a scene title above>",
      "size": "<Wide | Medium | Close-Up | Medium Close-Up | Insert | Extreme Close-Up | Tracking | Overhead>",
      "motion": "<Static | Slow push in | Dolly in | Dolly out | Tracking left to right | Pan | Tilt | Handheld | Crane up | Rack focus>",
      "duration": "<Xs — see duration rules below>",
      "model": "<Kling | Seedance | Van>",
      "refs": "<@ref tokens from reference_map, comma-separated, or empty string>",
      "firstFrame": "<brief first-frame visual description>",
      "prompt": "<full production-ready generation prompt for the chosen model>",
      "status": "todo",
      "note": ""
    }
  ],
  "reference_map": {
    "people": "<Identify recurring characters and define ref IDs, e.g. John: @john_ref_01\\nSarah: @sarah_ref_02>",
    "props": "<Identify recurring key objects/props, e.g. Car: @car_ref_01>",
    "locations": "<Identify recurring settings/locations, e.g. Forest: @forest_ref_01>",
    "soulIds": "<Optionally suggest style/actor IDs, or leave blank>"
  }
}

DURATION RULES:
- Kling: 3–15 s, any integer. Use 5–8 s for standard shots, 10–15 s for hero shots.
- Seedance: ONLY these values: 4, 5, 6, 8, 10, 12, 15. Round to nearest valid value.
- Van: 2–15 s, any integer.
- No single clip may exceed 15 s.
- If no time limit is specified, aim for 6–8 s per shot on average.
- If a time limit IS specified, distribute duration across shots to stay within it.

BEATS: 3–5 high-level narrative/emotional acts that structure the film.
SCENES: Group shots by location/setup. Each scene = one physical location or setup.
SHOTS: All shots needed to tell the story. Typical productions have 8–20 shots.
  - Follow the model decision tree from the guidelines below.
  - Write prompts in the style described for each model.
  - Suggest reference IDs and define them in the "reference_map" field.
  - Use those suggested @ref tokens in the shots' "refs" and "prompt" fields (e.g. "@lead_ref_01").

{guidelines_block}

{examples_block}
"""

_SEEDANCE_DURATIONS = [4, 5, 6, 8, 10, 12, 15]


def _snap_seedance_duration(seconds: int) -> int:
    return min(_SEEDANCE_DURATIONS, key=lambda v: abs(v - seconds))


def _parse_duration_seconds(duration_str: str) -> int:
    cleaned = duration_str.strip().lower().rstrip("s").strip()
    try:
        return int(float(cleaned))
    except ValueError:
        return 6


def _fix_shot_durations(shots: list[Shot]) -> list[Shot]:
    fixed = []
    for shot in shots:
        secs = _parse_duration_seconds(shot.duration)
        secs = max(2, min(15, secs))
        if shot.model == "Seedance":
            secs = _snap_seedance_duration(secs)
        elif shot.model == "Kling":
            secs = max(3, secs)
        fixed.append(shot.model_copy(update={"duration": f"{secs}s"}))
    return fixed


def parse_script(request: ScriptParseRequest) -> ScriptParseResponse:
    client = _build_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    guidelines = _load_model_guidelines()
    guidelines_block = (
        f"[MODEL SELECTION GUIDELINES]\n{guidelines}" if guidelines else ""
    )

    examples = _load_prompt_examples()
    examples_block = (
        f"[PROMPT EXAMPLES & BEST PRACTICES]\n{examples}" if examples else ""
    )

    system_prompt = (
        _SYSTEM_PROMPT
        .replace("{guidelines_block}", guidelines_block)
        .replace("{examples_block}", examples_block)
    )

    ref_summary = "\n".join(
        f"  {k}: {v}" for k, v in request.reference_map.items() if v.strip()
    )

    user_content_parts = [f"SCRIPT:\n{request.script}"]
    if request.project_name:
        user_content_parts.append(f"Project name: {request.project_name}")
    if request.time_limit:
        user_content_parts.append(f"Total time limit: {request.time_limit}")
    if request.platforms:
        user_content_parts.append(f"Preferred platforms: {', '.join(request.platforms)}")
    if ref_summary:
        user_content_parts.append(f"Reference map:\n{ref_summary}")
    if request.notes:
        user_content_parts.append(f"Director notes: {request.notes}")

    user_content = "\n\n".join(user_content_parts)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        response_format={"type": "json_object"},
        max_tokens=4096,
    )

    raw = response.choices[0].message.content or ""
    data = json.loads(raw)

    beats = [Beat(**b) for b in data.get("beats", [])]
    scenes = [Scene(**s) for s in data.get("scenes", [])]
    shots = _fix_shot_durations([Shot(**s) for s in data.get("shots", [])])

    reference_map = data.get("reference_map", {})
    clean_ref_map = {
        "people": reference_map.get("people", ""),
        "props": reference_map.get("props", ""),
        "locations": reference_map.get("locations", ""),
        "soulIds": reference_map.get("soulIds", ""),
    }

    return ScriptParseResponse(beats=beats, scenes=scenes, shots=shots, reference_map=clean_ref_map)
