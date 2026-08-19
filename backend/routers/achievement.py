from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from models import User
from models_result import QuizResult

router = APIRouter(tags=["Achievements"])

# --------------------------------------------------
# BADGES
# --------------------------------------------------


@router.get("/badges/{user_id}")
def badges(user_id: int, db: Session = Depends(get_db)):

    total = db.query(QuizResult).filter(QuizResult.user_id == user_id).count()

    badges = []

    if total >= 1:
        badges.append(
            {"icon": "🎯", "name": "Starter", "desc": "Completed your first quiz."}
        )

    if total >= 5:
        badges.append(
            {"icon": "🔥", "name": "Active Learner", "desc": "Completed 5 quizzes."}
        )

    if total >= 10:
        badges.append(
            {"icon": "🏆", "name": "Pro Learner", "desc": "Completed 10 quizzes."}
        )

    if total >= 25:
        badges.append(
            {"icon": "🚀", "name": "Master Learner", "desc": "Completed 25 quizzes."}
        )

    return {"badges": badges}


# --------------------------------------------------
# LEADERBOARD
# --------------------------------------------------


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):

    users = db.query(User).order_by(User.xp.desc()).all()

    leaderboard = []

    for user in users:

        total_quizzes = (
            db.query(QuizResult).filter(QuizResult.user_id == user.id).count()
        )

        leaderboard.append(
            {
                "user_id": user.id,
                "name": user.full_name,
                "xp": user.xp,
                "level": user.level,
                "english_rank": user.english_rank,
                "streak": user.streak,
                "quizzes": total_quizzes,
            }
        )

    # -----------------------------------
    # [DEBUG] XP Flow Logging (temporary)
    # -----------------------------------
    print(
        f"[XP-DEBUG] leaderboard | "
        f"users_returned={len(leaderboard)} | "
        f"top_user={leaderboard[0]['name'] if leaderboard else 'none'} | "
        f"top_xp={leaderboard[0]['xp'] if leaderboard else 0}"
    )

    return {"leaderboard": leaderboard}
