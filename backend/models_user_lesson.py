from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from database import Base


class UserLesson(Base):

    __tablename__ = "user_lessons"

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),)

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
    )

    completed = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )
