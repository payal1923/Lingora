from pydantic import BaseModel


class QuizResultCreate(BaseModel):
    user_id: int
    score: int
    total_questions: int


class QuizResultResponse(BaseModel):
    id: int
    user_id: int
    score: int
    total_questions: int

    class Config:
        from_attributes = True
