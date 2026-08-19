from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    ForeignKey,
    DateTime,
    Date,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from database import Base


# --------------------------------------------------
# SPEAKING PROGRESS
# Tracks completion of each speaking lesson per user.
# lesson_key format: "beginner-1", "intermediate-3", "advanced-15"
# --------------------------------------------------


class SpeakingProgress(Base):
    __tablename__ = "speaking_progress"

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_key", name="uq_speaking_progress"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    lesson_key = Column(String(50), nullable=False)

    level = Column(String(30), nullable=False)

    lesson_index = Column(Integer, nullable=False)

    completed = Column(Boolean, default=False, nullable=False)

    score = Column(Integer, default=0)

    xp_earned = Column(Integer, default=0)

    words_learned = Column(Integer, default=0)

    sentences_practiced = Column(Integer, default=0)

    conversation_completed = Column(Boolean, default=False)

    perfect = Column(Boolean, default=False)

    completed_at = Column(DateTime, nullable=True)


# --------------------------------------------------
# SPEAKING ATTEMPT
# Tracks individual word / sentence attempts for
# review + weak-word detection (spaced repetition).
# --------------------------------------------------


class SpeakingAttempt(Base):
    __tablename__ = "speaking_attempts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    lesson_key = Column(String(50), nullable=False)

    item_type = Column(String(20), nullable=False)  # "word" | "sentence"

    item_text = Column(String, nullable=False)

    spoken_text = Column(Text, nullable=True)

    pronunciation_score = Column(Integer, default=0)

    fluency_score = Column(Integer, default=0)

    accuracy_score = Column(Integer, default=0)

    overall_score = Column(Integer, default=0)

    is_weak = Column(Boolean, default=False)

    review_interval_days = Column(Integer, default=1)

    next_review = Column(Date, nullable=True)

    last_reviewed = Column(Date, nullable=True)

    review_count = Column(Integer, default=0)

    created_at = Column(DateTime, server_default=func.now())


# --------------------------------------------------
# SPEAKING STATS
# Aggregate speaking statistics per user.
# --------------------------------------------------


class SpeakingStats(Base):
    __tablename__ = "speaking_stats"

    __table_args__ = (UniqueConstraint("user_id", name="uq_speaking_stats"),)

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    words_learned = Column(Integer, default=0)

    sentences_practiced = Column(Integer, default=0)

    conversations_completed = Column(Integer, default=0)

    # Running sums used to compute averages
    total_pronunciation = Column(Integer, default=0)

    total_fluency = Column(Integer, default=0)

    total_accuracy = Column(Integer, default=0)

    score_count = Column(Integer, default=0)

    perfect_lessons = Column(Integer, default=0)

    perfect_conversations = Column(Integer, default=0)

    current_streak = Column(Integer, default=0)

    longest_streak = Column(Integer, default=0)

    last_practice_date = Column(Date, nullable=True)
