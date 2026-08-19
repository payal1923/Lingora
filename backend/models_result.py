from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from database import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)

    # REAL timestamp for streak + history tracking
    created_at = Column(DateTime, default=datetime.utcnow)
