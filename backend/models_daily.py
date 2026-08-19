from sqlalchemy import Column, Integer, String, Text
from database import Base


class DailyQuestion(Base):

    __tablename__ = "daily_questions"

    id = Column(Integer, primary_key=True, index=True)

    category = Column(String(50), nullable=False, default="Grammar")

    difficulty = Column(String(30), nullable=False, default="Beginner")

    question = Column(Text, nullable=False)

    option1 = Column(String, nullable=False)

    option2 = Column(String, nullable=False)

    option3 = Column(String, nullable=False)

    option4 = Column(String, nullable=False)

    answer = Column(String, nullable=False)

    explanation = Column(Text, nullable=True)
