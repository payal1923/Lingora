from typing import Optional
from pydantic import BaseModel, Field


class VocabularySearchRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)


class VocabularyResponse(BaseModel):
    id: int
    word: str
    pronunciation: Optional[str] = None
    part_of_speech: Optional[str] = None
    meaning: str
    example: str
    example2: Optional[str] = None
    synonyms: Optional[str] = None
    antonyms: Optional[str] = None
    ai_tip: Optional[str] = None
    common_mistakes: Optional[str] = None
    when_to_use: Optional[str] = None
    when_not_to_use: Optional[str] = None
    natural_sentence: Optional[str] = None
    formal_sentence: Optional[str] = None
    informal_sentence: Optional[str] = None
    difficulty: Optional[str] = "Beginner"
    category: Optional[str] = "Daily Life"
    xp_reward: Optional[int] = 10

    class Config:
        from_attributes = True
