import os

from openai import OpenAI

from app.schemas.chat import ChatMessage


def _build_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY or OPEN_API_KEY is not set in the server environment.")
    return OpenAI(api_key=api_key)


def _load_model_guidelines() -> str:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(current_dir, "model_guidelines.txt"),
        os.path.join(current_dir, "..", "model_guidelines.txt"),
        os.path.join(current_dir, "..", "..", "model_guidelines.txt"),
        "model_guidelines.txt",
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return f.read().strip()
            except Exception:
                pass
    return ""


def generate_chat_reply(
    *,
    messages: list[ChatMessage],
    system_prompt: str,
    model: str | None = None,
) -> str:
    client = _build_client()
    chat_model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    guidelines = _load_model_guidelines()
    full_system_prompt = system_prompt
    if guidelines:
        full_system_prompt = f"{system_prompt}\n\n[Reference Model Guidelines]\n{guidelines}"

    response = client.chat.completions.create(
        model=chat_model,
        messages=[
            {"role": "system", "content": full_system_prompt},
            *[message.model_dump() for message in messages],
        ],
    )

    choice = response.choices[0]
    content = choice.message.content if choice.message else None
    if not content:
        raise RuntimeError("OpenAI returned an empty response.")

    return content.strip()
