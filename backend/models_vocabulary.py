from sqlalchemy import Column, Integer, String, Text
from database import Base


class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, nullable=False)
    normalized_word = Column(String, nullable=False)
    pronunciation = Column(String, nullable=True)
    part_of_speech = Column(String, nullable=True)
    meaning = Column(String, nullable=False)
    example = Column(String, nullable=False)
    example2 = Column(String, nullable=True)
    synonyms = Column(String, nullable=True)
    antonyms = Column(String, nullable=True)
    ai_tip = Column(Text, nullable=True)
    common_mistakes = Column(Text, nullable=True)
    when_to_use = Column(Text, nullable=True)
    when_not_to_use = Column(Text, nullable=True)
    natural_sentence = Column(Text, nullable=True)
    formal_sentence = Column(Text, nullable=True)
    informal_sentence = Column(Text, nullable=True)
    difficulty = Column(String, nullable=True, default="Beginner")
    category = Column(String, nullable=True, default="Daily Life")
    xp_reward = Column(Integer, nullable=True, default=10)
