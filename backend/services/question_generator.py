import json
import os

from sqlalchemy.orm import Session
from models_daily import DailyQuestion
from services.question_validation import is_valid_question, resolve_answer, trace_question


def generate_questions_if_needed(db: Session, client):

    total_questions = db.query(DailyQuestion).count()

    existing_questions = (
        db.query(DailyQuestion.question)
        .order_by(DailyQuestion.id.desc())
        .limit(50)
        .all()
    )

    existing_questions = [q[0] for q in existing_questions]

    MINIMUM_QUESTION_BANK = 500

    # Stop generating if we already have enough questions
    if total_questions >= MINIMUM_QUESTION_BANK:
        return

    # Generate only the required number of questions
    questions_needed = MINIMUM_QUESTION_BANK - total_questions
    questions_to_generate = min(20, questions_needed)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=1.0,
        max_tokens=4096,
        messages=[
            {
                "role": "system",
                "content": f"""
You are Lingora AI.

Generate exactly {questions_to_generate} UNIQUE beginner English MCQ questions.

IMPORTANT:
- Never generate a question that already exists.
- Return ONLY valid JSON.
- No markdown.
- No explanations outside JSON.

Existing Questions:

{existing_questions}

Each question must follow this format:

[
    {{
        "category": "Grammar",
        "difficulty": "Beginner",
        "question": "",
        "option1": "",
        "option2": "",
        "option3": "",
        "option4": "",
        "answer": "",
        "explanation": ""
    }}
]

Rules:
- Beginner English only.
- Mix Grammar, Vocabulary, Spelling, Reading and Speaking questions.
- Four options.
- One correct answer.
- Short explanation.
- Every question must be unique.
""",
            }
        ],
    )

    reply = response.choices[0].message.content.strip()

    try:
        questions = json.loads(reply)
    except Exception as e:
        print("JSON Parse Error:", e)
        print(reply)
        return

    saved_count = 0
    skipped_invalid = 0
    is_dev = os.getenv("LINGORA_ENV", "dev") == "dev"

    for q in questions:

        try:

            # Validate BEFORE saving: the answer must correspond to exactly
            # one of the four options (exact, 1-based index, or normalized).
            # If the LLM returned a numeric index ("1".."4"), resolve it to
            # the actual option text so the stored answer always equals an
            # option. Invalid questions are skipped and never persisted.
            if not is_valid_question(q):
                skipped_invalid += 1
                if is_dev:
                    print("--- Rejected invalid generated question ---")
                    print(trace_question(q))
                continue

            resolved_answer, _, _ = resolve_answer(q)

            exists = (
                db.query(DailyQuestion)
                .filter(DailyQuestion.question == q["question"])
                .first()
            )

            if exists:
                continue

            db.add(
                DailyQuestion(
                    category=q.get("category", "Grammar"),
                    difficulty=q.get("difficulty", "Beginner"),
                    question=q["question"],
                    option1=q["option1"],
                    option2=q["option2"],
                    option3=q["option3"],
                    option4=q["option4"],
                    answer=resolved_answer,
                    explanation=q.get("explanation", ""),
                )
            )

            saved_count += 1

        except Exception as e:
            print("Skipped Question:", e)
            continue

    db.commit()

    print(f"✅ Added {saved_count} new questions. Skipped {skipped_invalid} invalid.")
