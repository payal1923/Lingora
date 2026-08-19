from pydantic import BaseModel


class LearnedWordCreate(BaseModel):
    user_id: int
    vocabulary_id: int
