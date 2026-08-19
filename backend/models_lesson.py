from sqlalchemy import Column, Integer, String, Text
from database import Base


class Lesson(Base):

    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    description = Column(Text)

    level = Column(String(30), nullable=False)

    lesson_order = Column(Integer, nullable=False)

    xp_reward = Column(Integer, default=20)
