from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func

from datetime import date, timedelta

from database import Base, engine, get_db

# Models
import models
import models_result
import models_vocabulary
import models_learned
import models_daily
import models_achievement
import models_lesson
import models_user_lesson
import models_speaking


from models import User
from models_result import QuizResult
from models_vocabulary import Vocabulary
from models_learned import LearnedWord
from models_favorite import FavoriteWord
from models_daily import DailyQuestion
from models_achievement import Achievement
from models_lesson import Lesson
from models_user_lesson import UserLesson
from config import client
from routers import grammar

# Router
from routers.auth import router
from routers.auth import router as auth_router
from routers.dashboard import router as dashboard_router
from routers.lessons import router as lessons_router
from routers.lessons import router as lessons_router
from routers.daily import router as daily_router
from routers.vocabulary import router as vocabulary_router
from routers.ai import router as ai_router
from routers.progress import router as progress_router
from routers.achievement import router as achievement_router
from routers.password import router as password_router
from routers.speaking import router as speaking_router

# Services
from services.question_generator import generate_questions_if_needed
from services.achievement_service import unlock_achievements
from seed_lessons import seed_lessons
from seed_vocabulary import seed_vocabulary

# Schemas
from schemas import UserCreate, UserLogin
from schemas_learned import LearnedWordCreate

# --------------------------------------------------
# FASTAPI
# --------------------------------------------------

app = FastAPI()


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)
    inserted_lessons = seed_lessons()
    print(f"Lessons seed complete: inserted {inserted_lessons} lessons.")
    inserted_words = seed_vocabulary()
    print(f"Vocabulary seed complete: inserted {inserted_words} words.")


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lingora-nine.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost",
        "https://localhost",
        "http://192.168.1.2:5173",
        "http://10.156.100.220:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HOME
# --------------------------------------------------


@app.get("/")
def home():

    return {"message": "Welcome to Lingora Backend 🚀"}


# --------------------------------------------------
# SAVE DAILY CHALLENGE RESULT
# --------------------------------------------------


@app.post("/daily-challenge-result")
def save_daily_challenge_result(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    score = data.get("score")

    if user_id is None or score is None:

        raise HTTPException(status_code=400, detail="user_id and score are required")

    # -----------------------------------
    # Find User
    # -----------------------------------

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    today = date.today()

    # -----------------------------------
    # Already completed today?
    # -----------------------------------

    if user.daily_challenge_completed == today:

        return {
            "message": "You have already completed today's Daily Challenge.",
            "already_completed": True,
            "xp_earned": 0,
            "total_xp": user.xp,
            "level": user.level,
            "english_rank": user.english_rank,
            "streak": user.streak,
            "new_achievements": [],
        }

    # -----------------------------------
    # Save Quiz Result
    # -----------------------------------

    new_result = QuizResult(
        user_id=user_id,
        score=score,
        total_questions=5,
    )

    db.add(new_result)

    # -----------------------------------
    # XP
    # -----------------------------------

    xp_earned = score * 10
    previous_xp = user.xp

    user.xp += xp_earned

    # -----------------------------------
    # Level
    # -----------------------------------

    user.level = (user.xp // 100) + 1

    # -----------------------------------
    # English Rank
    # -----------------------------------

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

    # -----------------------------------
    # Daily Streak
    # -----------------------------------

    if user.last_daily_challenge is None:

        user.streak = 1

    elif user.last_daily_challenge == today:

        # Already counted today
        pass

    elif user.last_daily_challenge == today - timedelta(days=1):

        # Consecutive day
        user.streak += 1

    else:

        # Missed one or more days
        user.streak = 1

    # -----------------------------------
    # Update Dates
    # -----------------------------------

    user.last_daily_challenge = today
    user.daily_challenge_completed = today

    db.commit()

    # -----------------------------------
    # [DEBUG] XP Flow Logging (temporary)
    # -----------------------------------
    print(
        f"[XP-DEBUG] daily-challenge-result | "
        f"user_id={user_id} | previous_xp={previous_xp} | "
        f"earned_xp={xp_earned} | updated_xp={user.xp} | "
        f"commit=success"
    )

    # -----------------------------------
    # Unlock Achievements
    # -----------------------------------

    new_achievements = unlock_achievements(db, user)

    db.refresh(new_result)

    return {
        "message": "Daily Challenge completed successfully",
        "already_completed": False,
        "xp_earned": xp_earned,
        "total_xp": user.xp,
        "level": user.level,
        "english_rank": user.english_rank,
        "streak": user.streak,
        "new_achievements": new_achievements,
    }


# COMPLETE LESSON
# --------------------------------------------------


@app.post("/complete-lesson")
def complete_lesson(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    lesson_id = data.get("lesson_id")

    if not user_id or not lesson_id:

        raise HTTPException(
            status_code=400, detail="user_id and lesson_id are required"
        )

    # ----------------------------
    # Find Lesson
    # ----------------------------

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:

        raise HTTPException(status_code=404, detail="Lesson not found")

    # ----------------------------
    # Check Already Completed
    # ----------------------------

    existing = (
        db.query(UserLesson)
        .filter(UserLesson.user_id == user_id, UserLesson.lesson_id == lesson_id)
        .first()
    )

    if existing and existing.completed:

        return {"message": "Lesson already completed"}

    # ----------------------------
    # Save Completion
    # ----------------------------

    from datetime import datetime

    if existing:

        existing.completed = True
        existing.completed_at = datetime.utcnow()

    else:

        db.add(
            UserLesson(
                user_id=user_id,
                lesson_id=lesson_id,
                completed=True,
                completed_at=datetime.utcnow(),
            )
        )

    # ----------------------------
    # Give XP
    # ----------------------------

    user = db.query(User).filter(User.id == user_id).first()

    xp_earned = lesson.xp_reward

    user.xp += xp_earned

    # ----------------------------
    # Level
    # ----------------------------

    user.level = (user.xp // 100) + 1

    # ----------------------------
    # English Rank
    # ----------------------------

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

    return {
        "message": "Lesson completed",
        "xp_earned": xp_earned,
        "total_xp": user.xp,
        "level": user.level,
        "english_rank": user.english_rank,
    }


app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(lessons_router)
app.include_router(daily_router)
app.include_router(vocabulary_router)
app.include_router(ai_router)
app.include_router(progress_router)
app.include_router(achievement_router)
app.include_router(password_router)
app.include_router(grammar.router)
app.include_router(speaking_router)
