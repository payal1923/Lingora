from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class FavoriteWord(Base):
    __tablename__ = "favorite_words"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vocabulary_id = Column(Integer, ForeignKey("vocabulary.id"))
