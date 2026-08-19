from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import ForgotPasswordRequest

router = APIRouter(tags=["Password"])


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):

    email = data.email.strip().lower()

    user = db.query(User).filter(User.email == email).first()

    # Never reveal whether the email exists
    if not user:
        return {"message": "If an account exists, a reset email has been sent."}

    # Next step:
    # Generate reset token
    # Save token to database
    # Send reset email

    return {"message": "If an account exists, a reset email has been sent."}
