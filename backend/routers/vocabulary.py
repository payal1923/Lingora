import random
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models_vocabulary import Vocabulary
from models_learned import LearnedWord
from models_favorite import FavoriteWord
from models import User

from schemas_learned import LearnedWordCreate
from schemas_favorite import FavoriteWordCreate

router = APIRouter(tags=["Vocabulary"])

# --------------------------------------------------
# GET VOCABULARY (existing - kept intact)
# --------------------------------------------------


@router.get("/vocabulary")
def get_vocabulary(db: Session = Depends(get_db)):

    return db.query(Vocabulary).all()


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
