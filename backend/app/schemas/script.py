from typing import Literal

from pydantic import BaseModel, Field


class Beat(BaseModel):
    id: int
    title: str
    frame: str
    mood: str
    duration: str


class Scene(BaseModel):
    id: int
    title: str
    location: str
    time: str
    description: str
    shots: int
    duration: str


class Shot(BaseModel):
    id: int
    scene: str
    size: str
    motion: str
    duration: str
    model: Literal["Kling", "Seedance", "Van"]
    refs: str
    firstFrame: str
    lastFrame: str = ""
    prompt: str
    status: str = "todo"
    note: str = ""


class ScriptParseRequest(BaseModel):
    script: str = Field(min_length=1)
    project_name: str = ""
    time_limit: str = ""
    platforms: list[str] = []
    reference_map: dict[str, str] = {}
    notes: str = ""


class ScriptParseResponse(BaseModel):
    beats: list[Beat]
    scenes: list[Scene]
    shots: list[Shot]
    reference_map: dict[str, str] = {}

