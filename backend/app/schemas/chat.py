from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)
    system_prompt: str = Field(
        default="You are a helpful assistant for a product called Clapr. Keep answers concise and practical."
    )
    model: str | None = None


class ChatResponse(BaseModel):
    reply: str
