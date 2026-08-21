from fastapi import APIRouter, HTTPException

import json

from config import client

router = APIRouter(tags=["AI"])


@router.post("/ai-chat")
def ai_chat(data: dict):

    message = data.get("message", "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """
You are Lingora AI Teacher.

You teach beginner English.

Always return ONE valid JSON object.

Never return JSON inside another JSON.

The response MUST follow this schema exactly:

{
    "explanation": "Plain English explanation.",
    "examples": [
    "Example 1",
    "Example 2",
    "Example 3"
    ],
    "learning_tip": "Short learning tip."
}

Rules:

- explanation must be plain text.
- examples must contain exactly 3 strings.
- learning_tip must be plain text.
- No markdown.
- No code blocks.
- No extra text.
- No escaped JSON.
""",
            },
            {
                "role": "user",
                "content": message,
            },
        ],
    )

    reply = response.choices[0].message.content.strip()

    try:
        result = json.loads(reply)

        # Fix nested JSON inside explanation
        if isinstance(result.get("explanation"), str):
            explanation = result["explanation"].strip()

            if explanation.startswith("{"):
                try:
                    nested = json.loads(explanation)

                    result = {
                        "explanation": nested.get("explanation", ""),
                        "examples": nested.get("examples", []),
                        "learning_tip": nested.get(
                            "learning_tip", "Practice English every day."
                        ),
                    }

                except Exception:
                    pass

    except Exception:

        result = {
            "explanation": reply,
            "examples": [
                "Practice every day.",
                "Read English books.",
                "Speak English daily.",
            ],
            "learning_tip": "Practice English every day.",
        }

    return result


# --------------------------------------------------
# SPEAKING FEEDBACK
# --------------------------------------------------


@router.post("/speaking-feedback")
def speaking_feedback(data: dict):

    sentence = data.get("sentence", "").strip()

    if not sentence:

        raise HTTPException(status_code=400, detail="Sentence is required")

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": """
You are Lingora AI Speaking Coach.

Correct grammar, punctuation and obvious speech-recognition mistakes.

Return ONLY valid JSON.

Format:

{
    "correct_sentence":"",
    "grammar_feedback":"",
    "pronunciation_tip":"",
    "speaking_score":90
}
""",
            },
            {"role": "user", "content": sentence},
        ],
    )

    reply = response.choices[0].message.content.strip()

    try:

        result = json.loads(reply)

    except Exception:

        result = {
            "correct_sentence": sentence,
            "grammar_feedback": "Good attempt. Keep practicing.",
            "pronunciation_tip": "Speak slowly and clearly.",
            "speaking_score": 80,
        }

    return result


# --------------------------------------------------
# CONVERSATION CHAT
# --------------------------------------------------


@router.post("/conversation-chat")
def conversation_chat(data: dict):

    topic = data.get("topic", "Free Talk")
    difficulty = data.get("difficulty", "Beginner")
    history = data.get("history", [])

    if not history:
        raise HTTPException(status_code=400, detail="Conversation history is required")

    system_prompt = f"""
You are Lingora AI English Teacher.

Help users practice spoken English.

Topic:
{topic}

Difficulty:
{difficulty}

Rules:

- Stay on the selected topic.
- Reply naturally like a real English teacher.
- Ask only ONE question at a time.
- Reply in 2-4 short sentences.
- Correct grammar politely if needed.
- Encourage the learner.
- Return ONLY valid JSON.

Format:

{{
    "reply":"",
    "grammar_feedback":""
}}

Do NOT put JSON inside the "reply" field.
Do NOT wrap the response inside another JSON object.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]

    messages.extend(history)

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        temperature=0.7,
        response_format={"type": "json_object"},
        messages=messages,
    )

    reply = response.choices[0].message.content.strip()

    try:
        result = json.loads(reply)

    except Exception:
        result = {"reply": reply, "grammar_feedback": "Great job! Keep practicing."}

    # --------------------------------------------------
    # Fix nested JSON inside reply
    # --------------------------------------------------

    if isinstance(result.get("reply"), str):

        reply_text = result["reply"].strip()

        if reply_text.startswith("{"):

            try:

                nested = json.loads(reply_text)

                result = {
                    "reply": nested.get("reply", ""),
                    "grammar_feedback": nested.get(
                        "grammar_feedback", "Great job! Keep practicing."
                    ),
                }

            except Exception:
                pass

    return result
