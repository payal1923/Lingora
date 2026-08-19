from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_quizzes: int
    highest_score: int
    average_score: float

