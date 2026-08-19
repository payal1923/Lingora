from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserLogin

router = APIRouter()


# ---------------- REGISTER ----------------


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=user.password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# ---------------- LOGIN ----------------


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "full_name": db_user.full_name,
        "email": db_user.email,
        "onboarding_completed": db_user.onboarding_completed,
    }


# ---------------- COMPLETE ONBOARDING ----------------


@router.put("/users/{user_id}/complete-onboarding")
def complete_onboarding(user_id: int, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.onboarding_completed = True

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Onboarding completed successfully",
        "user_id": db_user.id,
        "onboarding_completed": db_user.onboarding_completed,
    }
