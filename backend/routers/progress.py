from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models import User
from models_result import QuizResult

router = APIRouter(tags=["Progress"])

# --------------------------------------------------
# XP
# --------------------------------------------------


@router.get("/xp/{user_id}")
def xp(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "xp": user.xp,
        "level": user.level,
        "progress": user.xp % 100,
        "english_rank": user.english_rank,
    }


# --------------------------------------------------
# STREAK
# --------------------------------------------------


@router.get("/streak/{user_id}")
def streak(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"streak": user.streak}


# --------------------------------------------------
# DAILY PROGRESS
# --------------------------------------------------


@router.get("/daily-progress/{user_id}")
def daily_progress(user_id: int, db: Session = Depends(get_db)):

    results = (
        db.query(QuizResult)
        .filter(
            QuizResult.user_id == user_id,
            QuizResult.total_questions == 5,
        )
        .all()
    )

    daily_count = len(results)

    daily_xp = sum(result.score * 10 for result in results)

    return {
        "daily_challenges": daily_count,
        "daily_xp": daily_xp,
    }


# --------------------------------------------------
# USER PROGRESS
# --------------------------------------------------


@router.get("/user-progress/{user_id}")
def get_user_progress(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "xp": user.xp,
        "level": user.level,
        "english_rank": user.english_rank,
        "streak": user.streak,
    }
