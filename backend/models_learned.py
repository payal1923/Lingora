from sqlalchemy import Column, Integer, ForeignKey, String, Date
from database import Base


class LearnedWord(Base):
    __tablename__ = "learned_words"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vocabulary_id = Column(Integer, ForeignKey("vocabulary.id"))
    # Learning status: New | Learning | Mastered | Reviewed
    status = Column(String, nullable=True, default="Learning")
    # Spaced repetition
    review_interval_days = Column(Integer, nullable=True, default=1)
    next_review = Column(Date, nullable=True)
    last_reviewed = Column(Date, nullable=True)
    review_count = Column(Integer, nullable=True, default=0)
