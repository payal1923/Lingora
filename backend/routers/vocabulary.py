import random
from datetime import date, timedelta

import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db

from models_vocabulary import Vocabulary
from models_vocabulary_search_history import VocabularySearchHistory
from models_learned import LearnedWord
from models_favorite import FavoriteWord
from models import User

from schemas_learned import LearnedWordCreate
from schemas_favorite import FavoriteWordCreate
from schemas_vocabulary import VocabularyResponse

from config import client

router = APIRouter(tags=["Vocabulary"])


REQUIRED_AI_FIELDS = {"word", "pronunciation", "part_of_speech", "meaning", "example"}


def generate_vocabulary_with_ai(word: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """
You are Lingora Vocabulary Generator.

You generate accurate English word entries for language learners.

Return ONLY a valid JSON object with EXACTLY these five keys:
- word: string (the queried word, same case as input)
- pronunciation: string (IPA-like pronunciation)
- part_of_speech: string (e.g. noun, verb, adjective)
- meaning: string (clear, concise definition)
- example: string (natural usage example sentence)

Rules:
- Do NOT include any other keys.
- Do NOT wrap the JSON in another object.
- Do NOT return markdown, code blocks, or extra text.
- All values must be non-empty strings.
- The word value must exactly match the user's queried word.
""",
            },
            {
                "role": "user",
                "content": f"Generate vocabulary entry for: {word}",
            },
        ],
    )

    reply = response.choices[0].message.content.strip()

    try:
        result = json.loads(reply)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Invalid AI response: malformed JSON",
        )

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=502,
            detail="Invalid AI response: not a JSON object",
        )

    missing = REQUIRED_AI_FIELDS - set(result.keys())
    if missing:
        raise HTTPException(
            status_code=502,
            detail=f"Invalid AI response: missing fields {missing}",
        )

    for field in REQUIRED_AI_FIELDS:
        value = result.get(field)
        if not isinstance(value, str) or not value.strip():
            raise HTTPException(
                status_code=502,
                detail=f"Invalid AI response: field '{field}' is empty or invalid",
            )

    if result["word"].strip().lower() != word.strip().lower():
        raise HTTPException(
            status_code=502,
            detail="Invalid AI response: word field does not match query",
        )

    return result

# --------------------------------------------------
# GET VOCABULARY (existing - kept intact)
# --------------------------------------------------


@router.get("/vocabulary")
def get_vocabulary(db: Session = Depends(get_db)):

    return db.query(Vocabulary).all()


# --------------------------------------------------
# VOCABULARY SEARCH (AI-powered lookup)
# --------------------------------------------------


@router.get("/vocabulary/search", response_model=VocabularyResponse)
def vocabulary_search(
    word: str = Query(..., min_length=1, max_length=100),
    db: Session = Depends(get_db),
):

    normalized = word.strip().lower()

    if not normalized:
        raise HTTPException(
            status_code=400,
            detail="Word must not be empty",
        )

    existing = (
        db.query(Vocabulary)
        .filter(Vocabulary.normalized_word == normalized)
        .first()
    )

    if existing:
        return existing

    generated = generate_vocabulary_with_ai(word.strip())

    db_word = Vocabulary(
        word=generated["word"].strip(),
        normalized_word=generated["word"].strip().lower(),
        pronunciation=generated["pronunciation"].strip(),
        part_of_speech=generated["part_of_speech"].strip(),
        meaning=generated["meaning"].strip(),
        example=generated["example"].strip(),
        xp_reward=10,
    )

    try:
        db.add(db_word)
        db.commit()
        db.refresh(db_word)
    except Exception:
        db.rollback()
        existing_after_fail = (
            db.query(Vocabulary)
            .filter(Vocabulary.normalized_word == normalized)
            .first()
        )
        if existing_after_fail:
            return existing_after_fail
        raise HTTPException(
            status_code=500,
            detail="Failed to persist generated vocabulary",
        )

    return db_word


# --------------------------------------------------
# VOCABULARY SEARCH HISTORY
# --------------------------------------------------


@router.post("/vocabulary/search-history")
def add_vocabulary_search_history(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    vocabulary_id = data.get("vocabulary_id")

    if user_id is None or vocabulary_id is None:
        raise HTTPException(
            status_code=400,
            detail="user_id and vocabulary_id are required",
        )

    existing = (
        db.query(VocabularySearchHistory)
        .filter(
            VocabularySearchHistory.user_id == user_id,
            VocabularySearchHistory.vocabulary_id == vocabulary_id,
        )
        .first()
    )

    if existing:
        return {"message": "Already in search history"}

    db.add(
        VocabularySearchHistory(
            user_id=user_id,
            vocabulary_id=vocabulary_id,
        )
    )
    db.commit()

    return {"message": "Added to search history"}


@router.get("/vocabulary/search-history/{user_id}")
def get_vocabulary_search_history(user_id: int, db: Session = Depends(get_db)):

    rows = (
        db.query(VocabularySearchHistory)
        .filter(VocabularySearchHistory.user_id == user_id)
        .order_by(VocabularySearchHistory.searched_at.desc())
        .all()
    )

    vocabulary_ids = [row.vocabulary_id for row in rows]

    words = (
        db.query(Vocabulary)
        .filter(Vocabulary.id.in_(vocabulary_ids))
        .all()
    )

    word_map = {w.id: w for w in words}

    result = []
    for row in rows:
        word = word_map.get(row.vocabulary_id)
        if word:
            result.append(word)

    return result


# --------------------------------------------------
# LEARNED WORDS (existing - kept intact)
# --------------------------------------------------


@router.post("/learned-word")
def mark_word_as_learned(learned: LearnedWordCreate, db: Session = Depends(get_db)):

    existing = (
        db.query(LearnedWord)
        .filter(
            LearnedWord.user_id == learned.user_id,
            LearnedWord.vocabulary_id == learned.vocabulary_id,
        )
        .first()
    )

    if existing:

        return {"message": "Word already learned"}

    db.add(
        LearnedWord(
            user_id=learned.user_id,
            vocabulary_id=learned.vocabulary_id,
            status="Learning",
            review_interval_days=1,
            next_review=date.today() + timedelta(days=1),
            last_reviewed=date.today(),
            review_count=1,
        )
    )

    db.commit()

    return {"message": "Word marked as learned"}


# --------------------------------------------------
# LEARNED WORD COUNT (existing - kept intact)
# --------------------------------------------------


@router.get("/learned-count/{user_id}")
def learned_count(user_id: int, db: Session = Depends(get_db)):

    count = db.query(LearnedWord).filter(LearnedWord.user_id == user_id).count()

    return {"learned_words": count}


# --------------------------------------------------
# VOCABULARY PROGRESS (existing - kept intact)
# --------------------------------------------------


@router.get("/vocabulary-progress/{user_id}")
def vocabulary_progress(user_id: int, db: Session = Depends(get_db)):

    learned = db.query(LearnedWord).filter(LearnedWord.user_id == user_id).count()

    total = db.query(Vocabulary).count()

    progress = int((learned / total) * 100) if total else 0

    return {
        "progress": progress,
        "learned_words": learned,
        "total_words": total,
    }


# --------------------------------------------------
# WORD OF THE DAY
# --------------------------------------------------


@router.get("/word-of-the-day")
def word_of_the_day(db: Session = Depends(get_db)):

    words = db.query(Vocabulary).all()

    if not words:
        raise HTTPException(status_code=404, detail="No vocabulary available")

    # Deterministic pick based on day of year so it stays stable for the day
    day_index = date.today().timetuple().tm_yday
    return words[day_index % len(words)]


# --------------------------------------------------
# LEARNED WORDS BY USER (with status)
# --------------------------------------------------


@router.get("/learned-words/{user_id}")
def get_learned_words(user_id: int, db: Session = Depends(get_db)):

    rows = (
        db.query(LearnedWord)
        .filter(LearnedWord.user_id == user_id)
        .all()
    )

    return {
        "learned_words": [
            {
                "vocabulary_id": row.vocabulary_id,
                "status": row.status or "Learning",
                "review_interval_days": row.review_interval_days or 1,
                "next_review": str(row.next_review) if row.next_review else None,
                "last_reviewed": str(row.last_reviewed) if row.last_reviewed else None,
                "review_count": row.review_count or 0,
            }
            for row in rows
        ]
    }


# --------------------------------------------------
# UPDATE LEARNING STATUS
# --------------------------------------------------


@router.post("/update-word-status")
def update_word_status(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    vocabulary_id = data.get("vocabulary_id")
    status = data.get("status")  # New | Learning | Mastered | Reviewed

    if user_id is None or vocabulary_id is None or not status:
        raise HTTPException(
            status_code=400,
            detail="user_id, vocabulary_id and status are required",
        )

    if status not in ("New", "Learning", "Mastered", "Reviewed"):
        raise HTTPException(status_code=400, detail="Invalid status")

    record = (
        db.query(LearnedWord)
        .filter(
            LearnedWord.user_id == user_id,
            LearnedWord.vocabulary_id == vocabulary_id,
        )
        .first()
    )

    if not record:
        # Create a record if it doesn't exist yet
        record = LearnedWord(
            user_id=user_id,
            vocabulary_id=vocabulary_id,
            status=status,
            review_interval_days=1,
            next_review=date.today() + timedelta(days=1),
            last_reviewed=date.today(),
            review_count=1,
        )
        db.add(record)
    else:
        record.status = status
        record.last_reviewed = date.today()
        record.review_count = (record.review_count or 0) + 1

        # Spaced repetition intervals
        intervals = [1, 3, 7, 14, 30]
        idx = min(record.review_count, len(intervals) - 1)
        record.review_interval_days = intervals[idx]
        record.next_review = date.today() + timedelta(days=intervals[idx])

    db.commit()

    return {
        "message": "Status updated",
        "status": record.status,
        "next_review": str(record.next_review) if record.next_review else None,
        "review_interval_days": record.review_interval_days,
    }


# --------------------------------------------------
# FAVORITES
# --------------------------------------------------


@router.post("/favorite-word")
def add_favorite(fav: FavoriteWordCreate, db: Session = Depends(get_db)):

    existing = (
        db.query(FavoriteWord)
        .filter(
            FavoriteWord.user_id == fav.user_id,
            FavoriteWord.vocabulary_id == fav.vocabulary_id,
        )
        .first()
    )

    if existing:
        return {"message": "Already favorited", "favorited": True}

    db.add(
        FavoriteWord(
            user_id=fav.user_id,
            vocabulary_id=fav.vocabulary_id,
        )
    )
    db.commit()

    return {"message": "Word favorited", "favorited": True}


@router.delete("/favorite-word")
def remove_favorite(
    user_id: int,
    vocabulary_id: int,
    db: Session = Depends(get_db),
):

    existing = (
        db.query(FavoriteWord)
        .filter(
            FavoriteWord.user_id == user_id,
            FavoriteWord.vocabulary_id == vocabulary_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    return {"message": "Favorite removed", "favorited": False}


@router.get("/favorite-words/{user_id}")
def get_favorites(user_id: int, db: Session = Depends(get_db)):

    rows = (
        db.query(FavoriteWord)
        .filter(FavoriteWord.user_id == user_id)
        .all()
    )

    return {
        "favorite_ids": [row.vocabulary_id for row in rows],
    }


# --------------------------------------------------
# VOCABULARY QUIZ
# --------------------------------------------------


@router.get("/vocabulary-quiz")
def vocabulary_quiz(count: int = 5, db: Session = Depends(get_db)):

    words = db.query(Vocabulary).all()

    if len(words) < 4:
        raise HTTPException(
            status_code=400, detail="Not enough words for a quiz"
        )

    sample = random.sample(words, min(count, len(words)))

    quiz = []
    for word in sample:
        # Build 4 options: the correct meaning + 3 distractors
        distractors = [w for w in words if w.id != word.id]
        options = random.sample(distractors, 3)
        options.append(word)
        random.shuffle(options)

        quiz.append(
            {
                "id": word.id,
                "word": word.word,
                "pronunciation": word.pronunciation,
                "correct_meaning": word.meaning,
                "options": [o.meaning for o in options],
            }
        )

    return {"quiz": quiz}


# --------------------------------------------------
# VOCABULARY XP
# --------------------------------------------------


@router.post("/vocabulary-award-xp")
def vocabulary_award_xp(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    xp_amount = data.get("xp_amount")

    if user_id is None or xp_amount is None:
        raise HTTPException(
            status_code=400, detail="user_id and xp_amount are required"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    previous_xp = user.xp
    user.xp += xp_amount
    user.level = (user.xp // 100) + 1

    if user.level >= 15:
        user.english_rank = "Expert"
    elif user.level >= 10:
        user.english_rank = "Fluent"
    elif user.level >= 6:
        user.english_rank = "Advanced"
    elif user.level >= 3:
        user.english_rank = "Intermediate"
    else:
        user.english_rank = "Beginner"

    db.commit()

    print(
        f"[XP-DEBUG] vocabulary-award-xp | "
        f"user_id={user_id} | previous_xp={previous_xp} | "
        f"earned_xp={xp_amount} | updated_xp={user.xp} | commit=success"
    )

    return {
        "message": "XP awarded",
        "xp_earned": xp_amount,
        "total_xp": user.xp,
        "level": user.level,
        "english_rank": user.english_rank,
    }


# --------------------------------------------------
# VOCABULARY DASHBOARD (progress + streak + xp)
# --------------------------------------------------


@router.get("/vocabulary-dashboard/{user_id}")
def vocabulary_dashboard(user_id: int, db: Session = Depends(get_db)):

    total_words = db.query(Vocabulary).count()
    learned = (
        db.query(LearnedWord).filter(LearnedWord.user_id == user_id).count()
    )
    mastered = (
        db.query(LearnedWord)
        .filter(
            LearnedWord.user_id == user_id,
            LearnedWord.status == "Mastered",
        )
        .count()
    )
    favorites = (
        db.query(FavoriteWord).filter(FavoriteWord.user_id == user_id).count()
    )

    # Words due for review today
    due_today = (
        db.query(LearnedWord)
        .filter(
            LearnedWord.user_id == user_id,
            LearnedWord.next_review <= date.today(),
        )
        .count()
    )

    progress = int((learned / total_words) * 100) if total_words else 0

    user = db.query(User).filter(User.id == user_id).first()
    streak = user.streak if user else 0
    xp = user.xp if user else 0

    # Weekly goal: learn 5 words this week (simplified)
    weekly_goal = 5
    weekly_progress = min(learned, weekly_goal)

    return {
        "total_words": total_words,
        "learned_words": learned,
        "mastered_words": mastered,
        "favorites": favorites,
        "due_today": due_today,
        "progress": progress,
        "streak": streak,
        "xp": xp,
        "weekly_goal": weekly_goal,
        "weekly_progress": weekly_progress,
    }
