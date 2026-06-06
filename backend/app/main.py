import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.script import ScriptParseRequest, ScriptParseResponse
from app.services.chat import generate_chat_reply
from app.services.script import parse_script


def _parse_origins(value: str | None) -> list[str]:
    if not value:
        return ["http://localhost:5173"]
    return [origin.strip() for origin in value.split(",") if origin.strip()]


app = FastAPI(title="Clapr API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(os.getenv("FRONTEND_ORIGIN")),
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
