import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models_daily import DailyQuestion
from sqlalchemy.sql.expression import func
from services.question_generator import generate_questions_if_needed
from services.question_validation import is_valid_question, resolve_answer, trace_question
from dotenv import load_dotenv
from config import client

router = APIRouter(tags=["Daily Challenge"])

# --------------------------------------------------
# DAILY CHALLENGE
# --------------------------------------------------

# Number of questions to serve per challenge.
QUESTIONS_PER_CHALLENGE = 5
# Safety cap so the validation loop can never spin forever if the DB is full
# of invalid rows.
MAX_CANDIDATES_TO_INSPECT = 50

is_dev = os.getenv("LINGORA_ENV", "dev") == "dev"


def _to_payload(q):
    """Build the API payload for a validated question.

    The stored `answer` is resolved to the actual option text it refers to
    (handles numeric-index answers and whitespace/case drift) so the
    frontend always receives an `answer` that exactly equals one option.
    """
    resolved_answer, _, _ = resolve_answer(q)
    return {
        "id": q.id,
        "category": q.category,
        "difficulty": q.difficulty,
        "question": q.question,
        "options": [q.option1, q.option2, q.option3, q.option4],
        "answer": resolved_answer,
        "explanation": q.explanation,
    }


@router.get("/daily-challenge")
def daily_challenge(db: Session = Depends(get_db)):

    # Automatically generate more questions if needed
    generate_questions_if_needed(db, client)

    # Pull more candidates than we need so we can skip any that fail
    # validation and still return a full challenge.
    candidates = (
        db.query(DailyQuestion)
        .order_by(func.random())
        .limit(MAX_CANDIDATES_TO_INSPECT)
        .all()
    )

    if not candidates:
        raise HTTPException(
            status_code=404, detail="No Daily Challenge questions found."
        )

    valid_payloads = []

    for q in candidates:
        if not is_valid_question(q):
            # Never send an invalid question to the frontend. Log it in dev
            # so the data issue is visible, then keep scanning.
            if is_dev:
                print("--- Skipped invalid Daily Challenge question ---")
                print(trace_question(q))
            continue

        valid_payloads.append(_to_payload(q))

        if is_dev:
            print("--- Serving Daily Challenge question ---")
            print(trace_question(q))

        if len(valid_payloads) >= QUESTIONS_PER_CHALLENGE:
            break

    if len(valid_payloads) < QUESTIONS_PER_CHALLENGE:
        # Not enough valid questions in the bank. This is a data-quality
        # problem, not a client error — surface it clearly.
        raise HTTPException(
            status_code=503,
            detail=(
                "Not enough valid Daily Challenge questions available. "
                f"Found {len(valid_payloads)} of {QUESTIONS_PER_CHALLENGE}. "
                "Please regenerate the question bank."
            ),
        )

    return valid_payloads
