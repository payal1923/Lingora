from sqlalchemy import Column, Integer, String, Date, Boolean
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, index=True, nullable=False)

    password = Column(String(255), nullable=False)

    # ---------------- User Progress ----------------

    xp = Column(Integer, default=0)

    level = Column(Integer, default=1)

    english_rank = Column(String(30), default="Beginner")

    streak = Column(Integer, default=0)

    # Stores the last date the user completed Daily Challenge
    last_daily_challenge = Column(Date, nullable=True)

    daily_challenge_completed = Column(Date, nullable=True)

    # ---------------- Onboarding ----------------

    onboarding_completed = Column(Boolean, default=False, nullable=False)
