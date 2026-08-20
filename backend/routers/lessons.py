from groq import Groq
from dotenv import load_dotenv
import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models_lesson import Lesson
from models_user_lesson import UserLesson

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

router = APIRouter(tags=["Lessons"])


# --------------------------------------------------
# ROADMAP
# --------------------------------------------------


@router.get("/roadmap/{user_id}")
def get_roadmap(user_id: int, db: Session = Depends(get_db)):

    lessons = db.query(Lesson).order_by(Lesson.lesson_order).all()

    completed_lessons = (
        db.query(UserLesson)
        .filter(UserLesson.user_id == user_id, UserLesson.completed == True)
        .all()
    )

    completed_ids = {lesson.lesson_id for lesson in completed_lessons}

    roadmap = []

    unlocked = True

    for lesson in lessons:

        completed = lesson.id in completed_ids

        roadmap.append(
            {
                "id": lesson.id,
                "title": lesson.title,
                "description": lesson.description,
                "level": lesson.level,
                "xp_reward": lesson.xp_reward,
                "completed": completed,
                "locked": not unlocked,
            }
        )

        if not completed:

            unlocked = False

    return roadmap


# --------------------------------------------------
# GET SINGLE LESSON
# --------------------------------------------------


@router.get("/lesson/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:

        raise HTTPException(status_code=404, detail="Lesson not found")

    return {
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.description,
        "level": lesson.level,
        "xp_reward": lesson.xp_reward,
    }


# AI LESSON
# --------------------------------------------------


@router.get("/lesson-ai/{lesson_id}")
def lesson_ai(lesson_id: int, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        temperature=0.4,
        messages=[
            {
                "role": "system",
                "content": """
You are Lingora AI.

Teach beginner English.

Return ONLY valid JSON.

Format:

{
    "explanation":"",
    "examples":[
        "",
        "",
        ""
    ],
    "learning_tip":""
}

Rules:

- Beginner English
- Simple explanation
- Exactly 3 examples
- One learning tip
- No markdown
- JSON only
""",
            },
            {
                "role": "user",
                "content": f"""

Lesson Title:

{lesson.title}

Lesson Description:

{lesson.description}

Generate an English lesson.

""",
            },
        ],
    )

    import json

    reply = response.choices[0].message.content.strip()

    try:

        result = json.loads(reply)

    except Exception:

        result = {"explanation": lesson.description, "examples": [], "learning_tip": ""}

    return {
        "title": lesson.title,
        "xp_reward": lesson.xp_reward,
        "explanation": result["explanation"],
        "examples": result["examples"],
        "learning_tip": result["learning_tip"],
    }


# AI LESSON QUIZ
# --------------------------------------------------


@router.get("/lesson-quiz/{lesson_id}")
def lesson_quiz(lesson_id: int, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """
You are Lingora AI.

Generate exactly 3 beginner English MCQs.

Return ONLY valid JSON.

Format:

{
    "questions":[
        {
            "question":"",
            "options":["","","",""],
            "answer":""
        }
    ]
}

Rules:

- Exactly 3 questions
- 4 options each
- Beginner English
- Based ONLY on the lesson
- No markdown
- JSON only
""",
            },
            {
                "role": "user",
                "content": f"""

Lesson Title:
{lesson.title}

Lesson Description:
{lesson.description}

Generate a quiz.

""",
            },
        ],
    )

    import json

    try:

        return json.loads(response.choices[0].message.content)

    except Exception:

        raise HTTPException(status_code=500, detail="Unable to generate quiz.")


# --------------------------------------------------
# COMPLETE LESSON
# --------------------------------------------------


@router.post("/complete-lesson")
def complete_lesson(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    lesson_id = data.get("lesson_id")

    if not user_id or not lesson_id:
        raise HTTPException(
            status_code=400, detail="user_id and lesson_id are required"
        )

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    user_lesson = (
        db.query(UserLesson)
        .filter(UserLesson.user_id == user_id, UserLesson.lesson_id == lesson_id)
        .first()
    )

    if user_lesson:

        if user_lesson.completed:
            return {
                "message": "Lesson already completed",
                "user_id": user_id,
                "lesson_id": lesson_id,
                "completed": True,
            }

        user_lesson.completed = True

    else:

        user_lesson = UserLesson(user_id=user_id, lesson_id=lesson_id, completed=True)

        db.add(user_lesson)

    db.commit()
    db.refresh(user_lesson)

    return {
        "message": "Lesson completed successfully",
        "user_id": user_id,
        "lesson_id": lesson_id,
        "completed": user_lesson.completed,
    }


# --------------------------------------------------
# LEARNING PROGRESS
# --------------------------------------------------


@router.get("/learning-progress/{user_id}")
def learning_progress(user_id: int, db: Session = Depends(get_db)):

    total_lessons = db.query(Lesson).count()

    completed_lessons = (
        db.query(UserLesson)
        .filter(UserLesson.user_id == user_id, UserLesson.completed == True)
        .count()
    )

    percentage = 0

    if total_lessons > 0:

        percentage = round((completed_lessons / total_lessons) * 100)

    return {
        "completed": completed_lessons,
        "total": total_lessons,
        "percentage": percentage,
    }
