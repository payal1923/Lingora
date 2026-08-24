from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base


class VocabularySearchHistory(Base):
    __tablename__ = "vocabulary_search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vocabulary_id = Column(Integer, ForeignKey("vocabulary.id"), nullable=False)
    searched_at = Column(DateTime, server_default=func.now(), nullable=False)
