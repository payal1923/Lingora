from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models_result import QuizResult

router = APIRouter(tags=["Dashboard"])


# --------------------------------------------------
# DASHBOARD
# --------------------------------------------------


@router.get("/dashboard/{user_id}")
def dashboard(user_id: int, db: Session = Depends(get_db)):

    results = db.query(QuizResult).filter(QuizResult.user_id == user_id).all()

    total = len(results)

    highest = max([r.score for r in results], default=0)

    average = sum(r.score for r in results) / total if total > 0 else 0

    return {
        "total_quizzes": total,
        "highest_score": highest,
        "average_score": round(average, 2),
    }
