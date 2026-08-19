from pydantic import BaseModel


class FavoriteWordCreate(BaseModel):
    user_id: int
    vocabulary_id: int
