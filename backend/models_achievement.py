from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    badge_name = Column(String(100), nullable=False)

    badge_icon = Column(String(20), nullable=False)

    unlocked_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
