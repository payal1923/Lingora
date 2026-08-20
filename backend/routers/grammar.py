import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from groq import Groq

router = APIRouter()

client = Groq()


class GrammarRequest(BaseModel):
    text: str


@router.post("/grammar-check")
def grammar_check(request: GrammarRequest):

    try:

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            temperature=0.3,
            messages=[
                {
                    "role": "system",
                    "content": """
You are Lingora AI Grammar Checker.

Check the user's English grammar.

Return ONLY valid JSON.

Format:

{
    "corrected_sentence": "",
    "explanation": "",
    "grammar_tip": ""
}

Rules:

- Correct grammar mistakes.
- Keep the original meaning.
- Use simple beginner-friendly English.
- Explain the mistake simply.
- Give one short grammar tip.
- No markdown.
- JSON only.
""",
                },
                {
                    "role": "user",
                    "content": request.text,
                },
            ],
        )

        reply = response.choices[0].message.content.strip()

        result = json.loads(reply)

        return {
            "corrected_sentence": result.get(
                "corrected_sentence",
                request.text,
            ),
            "explanation": result.get(
                "explanation",
                "",
            ),
            "grammar_tip": result.get(
                "grammar_tip",
                "",
            ),
        }

    except Exception as error:

        print("GRAMMAR CHECK ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to check grammar",
        )
