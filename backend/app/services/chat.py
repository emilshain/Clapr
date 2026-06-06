import os

from openai import OpenAI

from app.schemas.chat import ChatMessage


def _build_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the server environment.")
    return OpenAI(api_key=api_key)


def generate_chat_reply(
    *,
    messages: list[ChatMessage],
    system_prompt: str,
    model: str | None = None,
) -> str:
    client = _build_client()
    chat_model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    response = client.chat.completions.create(
        model=chat_model,
        messages=[
            {"role": "system", "content": system_prompt},
            *[message.model_dump() for message in messages],
        ],
    )

    choice = response.choices[0]
    content = choice.message.content if choice.message else None
    if not content:
        raise RuntimeError("OpenAI returned an empty response.")

    return content.strip()
