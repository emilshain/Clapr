from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.script import ScriptParseRequest, ScriptParseResponse
from app.services.chat import generate_chat_reply
from app.services.script import parse_script
from fastapi import HTTPException

app = FastAPI(title="Clapr API", version="0.1.0")

# CORS configuration for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel frontend will have the same domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    try:
        reply = generate_chat_reply(
            messages=payload.messages,
            system_prompt=payload.system_prompt,
            model=payload.model,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(reply=reply)

@app.post("/api/script/parse", response_model=ScriptParseResponse)
def script_parse(payload: ScriptParseRequest) -> ScriptParseResponse:
    try:
        return parse_script(payload)
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
