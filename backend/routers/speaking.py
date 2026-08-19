import json
import difflib
from datetime import date, timedelta, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc

from database import get_db
from config import client
from models import User
from models_speaking import (
    SpeakingProgress,
    SpeakingAttempt,
    SpeakingStats,
)
from services.achievement_service import unlock_achievements

router = APIRouter(tags=["Speaking Course"])


# --------------------------------------------------
# LEGACY: /speaking-practice (kept for backward compat)
# --------------------------------------------------


class _SpeakingRequest:
    def __init__(self, sentence: str):
        self.sentence = sentence


@router.post("/speaking-practice")
def speaking_practice_legacy(data: dict):
    """Original speaking-practice endpoint — preserved for backward compat."""
    sentence = (data.get("sentence") or "").strip()
    if not sentence:
        raise HTTPException(status_code=400, detail="sentence is required")

    prompt = f"""
You are an English speaking coach.

The user said:

"{sentence}"

Return ONLY valid JSON.

Example:

{{
    "correct_sentence":"I go to school every day.",
    "grammar_feedback":"Use 'go' instead of 'goes' with I.",
    "pronunciation_tip":"Pronounce 'school' clearly.",
    "speaking_score":92
}}
"""
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an English Teacher."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        reply = completion.choices[0].message.content
        return json.loads(reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# XP REWARDS
# --------------------------------------------------

XP_CORRECT_WORD = 5
XP_CORRECT_SENTENCE = 10
XP_COMPLETE_LESSON = 30
XP_PERFECT_LESSON = 50
XP_PERFECT_CONVERSATION = 100

# Spaced repetition review intervals (days)
REVIEW_INTERVALS = [1, 3, 7, 14, 30]


# ==================================================
# 1. SPEAKING ANALYSIS
# Analyze a spoken word or sentence.
# Returns pronunciation, fluency, accuracy, confidence,
# speaking speed, overall score + per-word feedback.
# ==================================================


@router.post("/speaking-analyze")
def speaking_analyze(data: dict):
    """
    Body:
      {
        "target": "Can I see the menu?",
        "spoken": "Can I see the menu",
        "item_type": "sentence" | "word"
      }
    """
    target = (data.get("target") or "").strip()
    spoken = (data.get("spoken") or "").strip()
    item_type = data.get("item_type", "sentence")

    if not target:
        raise HTTPException(
            status_code=400, detail="target is required"
        )

    # No speech detected -> return a zero score and let the learner retry.
    # We do NOT raise an error here so the frontend can show a friendly
    # "try again" state instead of a hard failure.
    if not spoken:
        return {
            "pronunciation": 0,
            "fluency": 0,
            "accuracy": 0,
            "confidence": 0,
            "speaking_speed": 0,
            "overall_score": 0,
            "word_scores": [],
            "feedback": {
                "pronunciation_tip": "No speech was detected. Please try again.",
                "grammar_tip": "",
                "vocabulary_tip": "",
                "natural_english_tip": "",
                "confidence_tip": "Speak clearly into the microphone and try again.",
                "speaking_tip": "Tap the mic button and say the target out loud.",
            },
            "correct_sentence": target,
            "summary": "No speech detected. Please try again.",
            "expected": target,
            "spoken": spoken,
            "no_speech": True,
        }

    # ---- Deterministic scoring (no LLM) ----
    # Scores are computed entirely from text similarity + a word-level
    # diff so they reflect the learner's actual performance and never
    # return an unrealistic flat 100. Missing, extra, or incorrect words
    # each reduce the relevant metric. The LLM is no longer trusted for
    # scores because it tended to return inflated (100) values.
    sim = _text_similarity(target, spoken)
    diff = _word_diff(target, spoken)
    scores = _score_from_diff(sim, diff, item_type)
    feedback = _feedback_from_diff(diff, sim, item_type)
    word_scores = _word_scores_from_diff(diff)
    summary = _summary_from_diff(sim, diff)

    return {
        "pronunciation": scores["pronunciation"],
        "fluency": scores["fluency"],
        "accuracy": scores["accuracy"],
        "confidence": scores["confidence"],
        "speaking_speed": scores["speaking_speed"],
        "overall_score": scores["overall_score"],
        "word_scores": word_scores,
        "feedback": feedback,
        "correct_sentence": target,
        "summary": summary,
        "expected": target,
        "spoken": spoken,
        "no_speech": False,
    }


# ==================================================
# 2. AI CONVERSATION
# Continue a mini AI conversation for a lesson.
# Uses today's vocabulary + lesson topic.
# ==================================================


@router.post("/speaking-conversation")
def speaking_conversation(data: dict):
    """
    Body:
      {
        "lesson_title": "Restaurant",
        "level": "Beginner",
        "vocabulary": ["menu","waiter","order","bill","reservation"],
        "turn": 3,
        "history": [{"role":"assistant","content":"..."},{"role":"user","content":"..."}]
      }
    """
    lesson_title = data.get("lesson_title", "Free Conversation")
    level = data.get("level", "Beginner")
    vocabulary = data.get("vocabulary", [])
    turn = data.get("turn", 1)
    history = data.get("history", [])

    if not history:
        raise HTTPException(
            status_code=400, detail="Conversation history is required"
        )

    vocab_str = ", ".join(vocabulary) if vocabulary else "general English"

    system_prompt = f"""
You are Lingora AI — a friendly, encouraging English speaking tutor.

You are running a mini conversation lesson.

Lesson topic: {lesson_title}
Learner level: {level}
Today's vocabulary to encourage: {vocab_str}
Conversation turn: {turn}

Rules:
- Stay in character as a friendly English tutor.
- Reply naturally in 1-3 short sentences.
- Ask only ONE follow-up question at a time.
- Try to naturally encourage the learner to use today's vocabulary.
- Politely correct grammar if the learner makes a mistake.
- Be warm and encouraging.
- Keep the conversation moving toward a natural conclusion around turn 8-10.
- Return ONLY valid JSON.

Schema:

{{
    "reply": "",
    "grammar_feedback": "",
    "vocabulary_feedback": "",
    "pronunciation_feedback": "",
    "natural_english_feedback": "",
    "encouragement": "",
    "should_end": false
}}

- should_end: true when the conversation has reached a natural conclusion
  (around turn 8-10) and the learner has done well.
- Do NOT put JSON inside the "reply" field.
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        reply = completion.choices[0].message.content.strip()
        result = json.loads(reply)

        # Fix nested JSON inside reply
        if isinstance(result.get("reply"), str):
            r = result["reply"].strip()
            if r.startswith("{"):
                try:
                    nested = json.loads(r)
                    result = {
                        "reply": nested.get("reply", ""),
                        "grammar_feedback": nested.get(
                            "grammar_feedback", ""
                        ),
                        "vocabulary_feedback": nested.get(
                            "vocabulary_feedback", ""
                        ),
                        "pronunciation_feedback": nested.get(
                            "pronunciation_feedback", ""
                        ),
                        "natural_english_feedback": nested.get(
                            "natural_english_feedback", ""
                        ),
                        "encouragement": nested.get("encouragement", ""),
                        "should_end": nested.get("should_end", False),
                    }
                except Exception:
                    pass

        result.setdefault("reply", "Tell me more!")
        result.setdefault("grammar_feedback", "")
        result.setdefault("vocabulary_feedback", "")
        result.setdefault("pronunciation_feedback", "")
        result.setdefault("natural_english_feedback", "")
        result.setdefault("encouragement", "You're doing great!")
        result.setdefault("should_end", False)

        return result

    except Exception as e:
        return {
            "reply": "I'm sorry, I didn't catch that. Could you say it again?",
            "grammar_feedback": "",
            "vocabulary_feedback": "",
            "pronunciation_feedback": "",
            "natural_english_feedback": "",
            "encouragement": "Keep going, you're doing great!",
            "should_end": False,
            "error": str(e),
        }


# ==================================================
# 3. SAVE ATTEMPT
# Persist a single word/sentence attempt + update stats.
# ==================================================


@router.post("/speaking-attempt")
def save_speaking_attempt(data: dict, db: Session = Depends(get_db)):
    user_id = data.get("user_id")
    lesson_key = data.get("lesson_key")
    item_type = data.get("item_type")
    item_text = data.get("item_text")
    spoken_text = data.get("spoken_text")
    pronunciation = int(data.get("pronunciation", 0))
    fluency = int(data.get("fluency", 0))
    accuracy = int(data.get("accuracy", 0))
    overall = int(data.get("overall_score", 0))

    if not user_id or not lesson_key or not item_type or not item_text:
        raise HTTPException(
            status_code=400,
            detail="user_id, lesson_key, item_type, item_text are required",
        )

    is_weak = overall < 70

    attempt = SpeakingAttempt(
        user_id=user_id,
        lesson_key=lesson_key,
        item_type=item_type,
        item_text=item_text,
        spoken_text=spoken_text,
        pronunciation_score=pronunciation,
        fluency_score=fluency,
        accuracy_score=accuracy,
        overall_score=overall,
        is_weak=is_weak,
        review_interval_days=1,
        next_review=date.today() + timedelta(days=1),
        last_reviewed=date.today(),
        review_count=1,
    )
    db.add(attempt)

    # Update aggregate stats
    stats = _get_or_create_stats(db, user_id)
    if item_type == "word":
        stats.words_learned = (stats.words_learned or 0) + 1
    else:
        stats.sentences_practiced = (stats.sentences_practiced or 0) + 1

    stats.total_pronunciation = (stats.total_pronunciation or 0) + pronunciation
    stats.total_fluency = (stats.total_fluency or 0) + fluency
    stats.total_accuracy = (stats.total_accuracy or 0) + accuracy
    stats.score_count = (stats.score_count or 0) + 1

    _update_streak(db, stats)

    db.commit()

    # XP for a correct item
    xp_earned = 0
    if overall >= 70:
        xp_earned = (
            XP_CORRECT_SENTENCE if item_type == "sentence" else XP_CORRECT_WORD
        )
        _award_xp(db, user_id, xp_earned)

    return {
        "message": "Attempt saved",
        "xp_earned": xp_earned,
        "is_weak": is_weak,
    }


# ==================================================
# 4. COMPLETE LESSON
# Mark a lesson complete, award XP, unlock achievements.
# ==================================================


@router.post("/speaking-complete-lesson")
def complete_speaking_lesson(data: dict, db: Session = Depends(get_db)):
    user_id = data.get("user_id")
    lesson_key = data.get("lesson_key")
    level = data.get("level")
    lesson_index = data.get("lesson_index")
    score = int(data.get("score", 0))
    words_learned = int(data.get("words_learned", 0))
    sentences_practiced = int(data.get("sentences_practiced", 0))
    conversation_completed = bool(data.get("conversation_completed", False))
    perfect = bool(data.get("perfect", False))
    perfect_conversation = bool(data.get("perfect_conversation", False))

    if not user_id or not lesson_key:
        raise HTTPException(
            status_code=400, detail="user_id and lesson_key are required"
        )

    progress = (
        db.query(SpeakingProgress)
        .filter(
            SpeakingProgress.user_id == user_id,
            SpeakingProgress.lesson_key == lesson_key,
        )
        .first()
    )

    if progress and progress.completed:
        return {
            "message": "Lesson already completed",
            "already_completed": True,
            "xp_earned": 0,
        }

    if progress:
        progress.completed = True
        progress.score = score
        progress.words_learned = words_learned
        progress.sentences_practiced = sentences_practiced
        progress.conversation_completed = conversation_completed
        progress.perfect = perfect
        progress.completed_at = datetime.utcnow()
    else:
        progress = SpeakingProgress(
            user_id=user_id,
            lesson_key=lesson_key,
            level=level or "Beginner",
            lesson_index=lesson_index or 0,
            completed=True,
            score=score,
            words_learned=words_learned,
            sentences_practiced=sentences_practiced,
            conversation_completed=conversation_completed,
            perfect=perfect,
            completed_at=datetime.utcnow(),
        )
        db.add(progress)

    # XP
    xp_earned = XP_COMPLETE_LESSON
    if perfect:
        xp_earned += XP_PERFECT_LESSON
    if perfect_conversation:
        xp_earned += XP_PERFECT_CONVERSATION

    _award_xp(db, user_id, xp_earned)

    # Stats
    stats = _get_or_create_stats(db, user_id)
    if perfect:
        stats.perfect_lessons = (stats.perfect_lessons or 0) + 1
    if perfect_conversation:
        stats.perfect_conversations = (stats.perfect_conversations or 0) + 1
    if conversation_completed:
        stats.conversations_completed = (stats.conversations_completed or 0) + 1
    _update_streak(db, stats)

    db.commit()

    # Unlock achievements (reuses existing system)
    user = db.query(User).filter(User.id == user_id).first()
    new_achievements = []
    if user:
        new_achievements = unlock_achievements(db, user)
        db.commit()

    return {
        "message": "Lesson completed",
        "already_completed": False,
        "xp_earned": xp_earned,
        "new_achievements": new_achievements,
    }


# ==================================================
# 5. SPEAKING ROADMAP
# Returns all 45 lessons with completion + lock status.
# ==================================================


# Static course definition (mirrors frontend data)
SPEAKING_COURSE = {
    "Beginner": [
        "Greetings",
        "Introducing Yourself",
        "Family",
        "Daily Routine",
        "Food",
        "Restaurant",
        "Shopping",
        "Travel",
        "School",
        "Friends",
        "Weather",
        "Health",
        "Hobbies",
        "Technology",
        "Daily Conversation",
    ],
    "Intermediate": [
        "Travel Problems",
        "Phone Calls",
        "Office Communication",
        "Business English",
        "Giving Opinions",
        "Storytelling",
        "Directions",
        "Hotel",
        "Airport",
        "Meeting People",
        "Problem Solving",
        "Job Interview",
        "Public Speaking",
        "Debate",
        "Conversation Practice",
    ],
    "Advanced": [
        "Negotiation",
        "Leadership",
        "Presentation",
        "Customer Communication",
        "Professional Meetings",
        "Networking",
        "Conflict Resolution",
        "Advanced Interviews",
        "Business Pitch",
        "Academic Discussion",
        "Critical Thinking",
        "Fluent Conversation",
        "Idioms",
        "Natural English",
        "Free AI Conversation",
    ],
}


@router.get("/speaking-roadmap/{user_id}")
def speaking_roadmap(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(SpeakingProgress)
        .filter(SpeakingProgress.user_id == user_id)
        .all()
    )
    completed_map = {r.lesson_key: r for r in rows}

    roadmap = []
    unlocked = True

    for level, titles in SPEAKING_COURSE.items():
        for idx, title in enumerate(titles, start=1):
            key = f"{level.lower()}-{idx}"
            record = completed_map.get(key)
            completed = bool(record and record.completed)
            roadmap.append(
                {
                    "key": key,
                    "title": title,
                    "level": level,
                    "lesson_index": idx,
                    "completed": completed,
                    "locked": not unlocked,
                    "score": record.score if record else 0,
                    "perfect": bool(record and record.perfect),
                }
            )
            if not completed:
                unlocked = False

    return {"roadmap": roadmap, "total_lessons": len(roadmap)}


# ==================================================
# 6. SPEAKING DASHBOARD
# Top dashboard stats for the speaking module.
# ==================================================


@router.get("/speaking-dashboard/{user_id}")
def speaking_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stats = _get_or_create_stats(db, user_id)

    # Completed lessons
    completed_lessons = (
        db.query(SpeakingProgress)
        .filter(
            SpeakingProgress.user_id == user_id,
            SpeakingProgress.completed == True,
        )
        .count()
    )

    total_lessons = 45
    progress_pct = int((completed_lessons / total_lessons) * 100) if total_lessons else 0

    # Current lesson = first not-completed in roadmap order
    current_level = "Beginner"
    current_lesson = "Greetings"
    current_lesson_index = 1
    current_lesson_key = "beginner-1"
    found_current = False
    for level, titles in SPEAKING_COURSE.items():
        for idx, title in enumerate(titles, start=1):
            key = f"{level.lower()}-{idx}"
            record = (
                db.query(SpeakingProgress)
                .filter(
                    SpeakingProgress.user_id == user_id,
                    SpeakingProgress.lesson_key == key,
                )
                .first()
            )
            if not (record and record.completed):
                current_level = level
                current_lesson = title
                current_lesson_index = idx
                current_lesson_key = key
                found_current = True
                break
        if found_current:
            break

    avg_pronunciation = _avg(stats.total_pronunciation, stats.score_count)
    avg_fluency = _avg(stats.total_fluency, stats.score_count)
    avg_accuracy = _avg(stats.total_accuracy, stats.score_count)

    # Daily goal: complete one lesson today
    today = date.today()
    completed_today = (
        db.query(SpeakingProgress)
        .filter(
            SpeakingProgress.user_id == user_id,
            SpeakingProgress.completed == True,
            SpeakingProgress.completed_at >= datetime(today.year, today.month, today.day),
        )
        .count()
    )
    daily_goal_done = completed_today >= 1

    return {
        "current_level": current_level,
        "current_lesson": current_lesson,
        "current_lesson_key": current_lesson_key,
        "current_lesson_index": current_lesson_index,
        "progress": progress_pct,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "current_streak": stats.current_streak or 0,
        "longest_streak": stats.longest_streak or 0,
        "xp": user.xp,
        "level": user.level,
        "english_rank": user.english_rank,
        "words_learned": stats.words_learned or 0,
        "sentences_practiced": stats.sentences_practiced or 0,
        "conversations_completed": stats.conversations_completed or 0,
        "perfect_lessons": stats.perfect_lessons or 0,
        "perfect_conversations": stats.perfect_conversations or 0,
        "average_pronunciation": avg_pronunciation,
        "average_fluency": avg_fluency,
        "average_accuracy": avg_accuracy,
        "daily_goal_done": daily_goal_done,
    }


# ==================================================
# 7. SPEAKING STATISTICS
# Weekly + monthly progress, averages, totals.
# ==================================================


@router.get("/speaking-statistics/{user_id}")
def speaking_statistics(user_id: int, db: Session = Depends(get_db)):
    stats = _get_or_create_stats(db, user_id)

    # Weekly progress (last 7 days)
    today = date.today()
    weekly = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = (
            db.query(SpeakingAttempt)
            .filter(
                SpeakingAttempt.user_id == user_id,
                SpeakingAttempt.created_at >= datetime(day.year, day.month, day.day),
                SpeakingAttempt.created_at < datetime(next_day.year, next_day.month, next_day.day),
            )
            .count()
        )
        weekly.append({"date": day.isoformat(), "attempts": count})

    # Monthly progress (last 30 days, grouped weekly)
    monthly = []
    for i in range(3, -1, -1):
        start = today - timedelta(days=(i + 1) * 7)
        end = today - timedelta(days=i * 7)
        count = (
            db.query(SpeakingAttempt)
            .filter(
                SpeakingAttempt.user_id == user_id,
                SpeakingAttempt.created_at >= datetime(start.year, start.month, start.day),
                SpeakingAttempt.created_at < datetime(end.year, end.month, end.day),
            )
            .count()
        )
        monthly.append({"week": i + 1, "attempts": count})

    return {
        "words_learned": stats.words_learned or 0,
        "sentences_practiced": stats.sentences_practiced or 0,
        "conversations_completed": stats.conversations_completed or 0,
        "average_pronunciation": _avg(stats.total_pronunciation, stats.score_count),
        "average_fluency": _avg(stats.total_fluency, stats.score_count),
        "average_accuracy": _avg(stats.total_accuracy, stats.score_count),
        "perfect_lessons": stats.perfect_lessons or 0,
        "perfect_conversations": stats.perfect_conversations or 0,
        "current_streak": stats.current_streak or 0,
        "longest_streak": stats.longest_streak or 0,
        "weekly": weekly,
        "monthly": monthly,
    }


# ==================================================
# 8. REVIEW WORDS
# Return weak words/sentences due for review.
# ==================================================


@router.get("/speaking-review/{user_id}")
def speaking_review(user_id: int, db: Session = Depends(get_db)):
    today = date.today()
    rows = (
        db.query(SpeakingAttempt)
        .filter(
            SpeakingAttempt.user_id == user_id,
            SpeakingAttempt.is_weak == True,
            SpeakingAttempt.next_review <= today,
        )
        .order_by(SpeakingAttempt.next_review.asc())
        .limit(20)
        .all()
    )

    return {
        "review_items": [
            {
                "id": r.id,
                "item_type": r.item_type,
                "item_text": r.item_text,
                "overall_score": r.overall_score,
                "next_review": str(r.next_review) if r.next_review else None,
                "review_count": r.review_count or 0,
            }
            for r in rows
        ],
        "count": len(rows),
    }


@router.post("/speaking-review-done")
def speaking_review_done(data: dict, db: Session = Depends(get_db)):
    attempt_id = data.get("attempt_id")
    overall = int(data.get("overall_score", 0))

    attempt = (
        db.query(SpeakingAttempt)
        .filter(SpeakingAttempt.id == attempt_id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    attempt.last_reviewed = date.today()
    attempt.review_count = (attempt.review_count or 0) + 1
    attempt.overall_score = overall

    # If the learner improved, mark not weak
    if overall >= 80:
        attempt.is_weak = False
        attempt.next_review = None
    else:
        idx = min(attempt.review_count, len(REVIEW_INTERVALS) - 1)
        attempt.review_interval_days = REVIEW_INTERVALS[idx]
        attempt.next_review = date.today() + timedelta(days=REVIEW_INTERVALS[idx])

    db.commit()

    return {
        "message": "Review saved",
        "is_weak": attempt.is_weak,
        "next_review": str(attempt.next_review) if attempt.next_review else None,
    }


# ==================================================
# 9. SPEAKING BADGES
# Speaking-specific badges.
# ==================================================


SPEAKING_BADGES = [
    {
        "key": "first_lesson",
        "icon": "🎯",
        "name": "First Lesson",
        "desc": "Complete your first speaking lesson.",
        "target": 1,
        "xp": 50,
        "current": lambda s, p: p,
        "check": lambda s, p: p >= 1,
    },
    {
        "key": "streak_7",
        "icon": "🔥",
        "name": "7 Day Streak",
        "desc": "Practice speaking 7 days in a row.",
        "target": 7,
        "xp": 100,
        "current": lambda s, p: (s.current_streak or 0),
        "check": lambda s, p: (s.current_streak or 0) >= 7,
    },
    {
        "key": "perfect_pronunciation",
        "icon": "🗣️",
        "name": "Perfect Pronunciation",
        "desc": "Score 100 on a word or sentence.",
        "target": 1,
        "xp": 150,
        "current": lambda s, p: (s.perfect_lessons or 0),
        "check": lambda s, p: (s.perfect_lessons or 0) >= 1,
    },
    {
        "key": "words_100",
        "icon": "📚",
        "name": "100 Words",
        "desc": "Learn 100 speaking words.",
        "target": 100,
        "xp": 200,
        "current": lambda s, p: (s.words_learned or 0),
        "check": lambda s, p: (s.words_learned or 0) >= 100,
    },
    {
        "key": "sentences_50",
        "icon": "💬",
        "name": "50 Sentences",
        "desc": "Practice 50 sentences.",
        "target": 50,
        "xp": 200,
        "current": lambda s, p: (s.sentences_practiced or 0),
        "check": lambda s, p: (s.sentences_practiced or 0) >= 50,
    },
    {
        "key": "conversations_10",
        "icon": "🤝",
        "name": "10 Conversations",
        "desc": "Complete 10 AI conversations.",
        "target": 10,
        "xp": 250,
        "current": lambda s, p: (s.conversations_completed or 0),
        "check": lambda s, p: (s.conversations_completed or 0) >= 10,
    },
    {
        "key": "fluent_speaker",
        "icon": "👑",
        "name": "Fluent Speaker",
        "desc": "Complete all 45 lessons.",
        "target": 45,
        "xp": 500,
        "current": lambda s, p: p,
        "check": lambda s, p: p >= 45,
    },
]


@router.get("/speaking-badges/{user_id}")
def speaking_badges(user_id: int, db: Session = Depends(get_db)):
    stats = _get_or_create_stats(db, user_id)
    completed = (
        db.query(SpeakingProgress)
        .filter(
            SpeakingProgress.user_id == user_id,
            SpeakingProgress.completed == True,
        )
        .count()
    )

    badges = []
    for b in SPEAKING_BADGES:
        unlocked = bool(b["check"](stats, completed))
        current = int(b["current"](stats, completed) or 0)
        target = int(b["target"])
        # Progress percentage 0-100 (capped at 100 when unlocked)
        progress = 100 if unlocked else min(100, int(round((current / target) * 100)) if target else 0)
        badges.append(
            {
                "key": b["key"],
                "icon": b["icon"],
                "name": b["name"],
                "desc": b["desc"],
                "unlocked": unlocked,
                "current": current,
                "target": target,
                "progress": progress,
                "xp": int(b["xp"]),
            }
        )

    return {"badges": badges}


# ==================================================
# Helpers
# ==================================================


def _get_or_create_stats(db: Session, user_id: int) -> SpeakingStats:
    stats = (
        db.query(SpeakingStats)
        .filter(SpeakingStats.user_id == user_id)
        .first()
    )
    if not stats:
        stats = SpeakingStats(user_id=user_id)
        db.add(stats)
        db.flush()
    return stats


def _award_xp(db: Session, user_id: int, amount: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    user.xp = (user.xp or 0) + amount
    user.level = (user.xp // 100) + 1
    if user.level >= 15:
        user.english_rank = "Expert"
    elif user.level >= 10:
        user.english_rank = "Fluent"
    elif user.level >= 6:
        user.english_rank = "Advanced"
    elif user.level >= 3:
        user.english_rank = "Intermediate"
    else:
        user.english_rank = "Beginner"


def _update_streak(db: Session, stats: SpeakingStats):
    today = date.today()
    if stats.last_practice_date is None:
        stats.current_streak = 1
    elif stats.last_practice_date == today:
        return
    elif stats.last_practice_date == today - timedelta(days=1):
        stats.current_streak = (stats.current_streak or 0) + 1
    else:
        stats.current_streak = 1
    stats.last_practice_date = today
    if (stats.current_streak or 0) > (stats.longest_streak or 0):
        stats.longest_streak = stats.current_streak


def _avg(total, count):
    if not count:
        return 0
    return round((total or 0) / count)


# --------------------------------------------------
# Similarity-based fallback scoring
# Used when the AI model fails or returns invalid scores.
# Produces realistic, varied scores (never a flat 80) based
# on how close the spoken text is to the target.
# --------------------------------------------------


def _normalize_text(t):
    """Lowercase, strip punctuation, collapse whitespace."""
    if not t:
        return ""
    import re
    t = t.lower().strip()
    t = re.sub(r"[^\w\s]", " ", t)  # punctuation -> space
    t = re.sub(r"\s+", " ", t)
    return t


def _text_similarity(target, spoken):
    """
    Returns a 0.0 - 1.0 similarity score between target and spoken text.
    Combines word-overlap (Jaccard) with a length penalty so partial
    answers and extra words reduce the score realistically.
    """
    t_words = _normalize_text(target).split()
    s_words = _normalize_text(spoken).split()
    if not t_words:
        return 0.0
    if not s_words:
        return 0.0

    t_set = set(t_words)
    s_set = set(s_words)
    # Jaccard-like overlap weighted by target coverage (recall)
    overlap = len(t_set & s_set)
    recall = overlap / len(t_set)  # how many target words were spoken

    # Precision: penalize lots of extra/incorrect words
    precision = overlap / len(s_set) if s_set else 0.0

    # F1-style blend
    if recall + precision == 0:
        f1 = 0.0
    else:
        f1 = 2 * (recall * precision) / (recall + precision)

    # Length ratio penalty: very short or very long answers lose points
    len_ratio = len(s_words) / len(t_words) if t_words else 0.0
    if len_ratio < 0.5:
        length_factor = 0.6 + 0.4 * (len_ratio / 0.5)  # 0.6 .. 1.0
    elif len_ratio > 1.5:
        length_factor = max(0.7, 1.0 - 0.15 * (len_ratio - 1.5))
    else:
        length_factor = 1.0

    # Weighted blend: recall matters most, then f1, then length
    score = (0.55 * recall + 0.25 * f1 + 0.20 * length_factor)
    return max(0.0, min(1.0, score))


def _score_from_similarity(sim):
    """
    Map a 0.0-1.0 similarity to a full score dict with realistic
    variation across pronunciation/fluency/accuracy/confidence/speed.
    Never returns a flat value — each dimension differs slightly.
    """
    # Base 0-100 from similarity, scaled so a perfect match ~ 95-98
    base = round(sim * 96 + 2)  # 2 .. 98

    # Small deterministic per-dimension offsets so scores aren't identical
    pronunciation = max(0, min(100, base + 1))
    fluency = max(0, min(100, base - 2))
    accuracy = max(0, min(100, base))
    confidence = max(0, min(100, base - 3))
    # Speed: if they said very little, speed is low; if lots of extra words, also lower
    speaking_speed = max(0, min(100, base - 1))
    overall = max(0, min(100, round((pronunciation + fluency + accuracy + confidence + speaking_speed) / 5)))

    return {
        "pronunciation": pronunciation,
        "fluency": fluency,
        "accuracy": accuracy,
        "confidence": confidence,
        "speaking_speed": speaking_speed,
        "overall_score": overall,
    }


def _summary_from_similarity(sim):
    """Encouraging one-line summary that matches the performance band."""
    if sim >= 0.9:
        return "Excellent! You matched the target almost perfectly."
    if sim >= 0.75:
        return "Great job! Just a small tweak away from perfect."
    if sim >= 0.6:
        return "Good effort! Try to match a few more words next time."
    if sim >= 0.4:
        return "Keep going — focus on the key words and speak clearly."
    return "Don't give up! Slow down and try the target again."


# --------------------------------------------------
# Deterministic scoring helpers (no LLM)
# The /speaking-analyze endpoint uses these to compute scores directly
# from how closely the spoken text matches the target, so scores are
# realistic and never an inflated flat 100.
# --------------------------------------------------


def _word_diff(target, spoken):
    """
    Align the target and spoken word lists and classify each target word
    as 'correct', 'missing', or 'incorrect', and collect any extra spoken
    words. Uses difflib sequence alignment so word order is respected.

    Returns a dict:
      {
        "target_words": [{"word": w, "status": "correct"|"missing"|"incorrect"}, ...],
        "extra_words":   [w, ...],
        "missing_words": [w, ...],
        "incorrect_pairs": [{"target": w, "spoken": w2}, ...],
        "correct_count": int,
        "target_count": int,
      }
    """
    t_words = _normalize_text(target).split()
    s_words = _normalize_text(spoken).split()

    matcher = difflib.SequenceMatcher(a=t_words, b=s_words, autojunk=False)
    target_words = []
    extra_words = []
    missing_words = []
    incorrect_pairs = []
    correct_count = 0

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for w in t_words[i1:i2]:
                target_words.append({"word": w, "status": "correct"})
                correct_count += 1
        elif tag == "delete":
            for w in t_words[i1:i2]:
                target_words.append({"word": w, "status": "missing"})
                missing_words.append(w)
        elif tag == "insert":
            for w in s_words[j1:j2]:
                extra_words.append(w)
        elif tag == "replace":
            t_seg = t_words[i1:i2]
            s_seg = s_words[j1:j2]
            n = max(len(t_seg), len(s_seg))
            for k in range(n):
                if k < len(t_seg) and k < len(s_seg):
                    target_words.append({"word": t_seg[k], "status": "incorrect"})
                    incorrect_pairs.append({"target": t_seg[k], "spoken": s_seg[k]})
                elif k < len(t_seg):
                    target_words.append({"word": t_seg[k], "status": "missing"})
                    missing_words.append(t_seg[k])
                else:
                    extra_words.append(s_seg[k])

    return {
        "target_words": target_words,
        "extra_words": extra_words,
        "missing_words": missing_words,
        "incorrect_pairs": incorrect_pairs,
        "correct_count": correct_count,
        "target_count": len(t_words),
    }


def _score_from_diff(sim, diff, item_type):
    """
    Map the similarity + word diff to a full score dict. Each metric is
    derived from the learner's actual performance so scores vary
    realistically and are reduced for missing, extra, or incorrect words.
    The overall score is a weighted blend of the individual metrics.
    """
    t_count = max(diff["target_count"], 1)
    correct = diff["correct_count"]
    missing_n = len(diff["missing_words"])
    incorrect_n = len(diff["incorrect_pairs"])
    extra_n = len(diff["extra_words"])

    # Accuracy: share of target words spoken correctly, minus a penalty
    # for extra/incorrect words (precision).
    word_acc = correct / t_count
    extra_penalty = min(0.25, extra_n * 0.08)
    accuracy = max(0, min(100, round((word_acc - extra_penalty) * 100)))

    # Pronunciation: similarity-based, lowered by incorrect/missing words.
    pronunciation = max(
        0, min(100, round((sim - incorrect_n * 0.04 - missing_n * 0.02) * 100))
    )

    # Fluency: similarity-based, lowered by extra words (disfluency) and gaps.
    fluency = max(0, min(100, round((sim - extra_n * 0.05 - missing_n * 0.03) * 100)))

    # Confidence: similarity-based, slightly lower; very low when mostly missing.
    confidence = max(0, min(100, round((sim - 0.03) * 100)))

    # Speaking speed: derived from how complete the answer was.
    completeness = correct / t_count
    speaking_speed = max(0, min(100, round(completeness * 90 + 5)))

    # Overall: weighted blend of the individual metrics.
    overall = max(
        0,
        min(
            100,
            round(
                0.30 * accuracy
                + 0.25 * pronunciation
                + 0.20 * fluency
                + 0.15 * confidence
                + 0.10 * speaking_speed
            ),
        ),
    )

    return {
        "pronunciation": pronunciation,
        "fluency": fluency,
        "accuracy": accuracy,
        "confidence": confidence,
        "speaking_speed": speaking_speed,
        "overall_score": overall,
    }


def _word_scores_from_diff(diff):
    """Per-target-word scores (0-100) derived from the diff status."""
    out = []
    for w in diff["target_words"]:
        if w["status"] == "correct":
            score = 100
        elif w["status"] == "incorrect":
            score = 35
        else:  # missing
            score = 0
        out.append({"word": w["word"], "score": score, "status": w["status"]})
    return out


def _feedback_from_diff(diff, sim, item_type):
    """
    Build the six feedback tips from the ACTUAL mistakes (missing, extra,
    incorrect words) instead of generic messages. Each tip references the
    specific words the learner got wrong.
    """
    missing = diff["missing_words"]
    extra = diff["extra_words"]
    incorrect = diff["incorrect_pairs"]
    correct = diff["correct_count"]
    t_count = diff["target_count"]

    def _join(words, limit=3):
        return ", ".join('"' + w + '"' for w in words[:limit])

    tips = {
        "pronunciation_tip": "",
        "grammar_tip": "",
        "vocabulary_tip": "",
        "natural_english_tip": "",
        "confidence_tip": "",
        "speaking_tip": "",
    }

    # Pronunciation — reference incorrect/missing words.
    if incorrect:
        pairs = ", ".join(
            '"' + p["target"] + '" (you said "' + p["spoken"] + '")'
            for p in incorrect[:3]
        )
        tips["pronunciation_tip"] = "Check the pronunciation of " + pairs + "."
    elif missing:
        tips["pronunciation_tip"] = (
            "You missed " + _join(missing) + " — say each word clearly."
        )
    else:
        tips["pronunciation_tip"] = "Clear pronunciation — keep it up!"

    # Grammar — missing words often mean dropped grammar; extras add clutter.
    if missing:
        tips["grammar_tip"] = (
            "Your sentence is missing "
            + _join(missing)
            + ". Try to include every word."
        )
    elif extra:
        tips["grammar_tip"] = (
            "You added extra words: " + _join(extra) + ". Keep your sentence tight."
        )
    else:
        tips["grammar_tip"] = "Your sentence structure matches the target."

    # Vocabulary — use the right word.
    if incorrect:
        tips["vocabulary_tip"] = (
            "Use '" + incorrect[0]["target"] + "' instead of '" + incorrect[0]["spoken"] + "'."
        )
    elif missing:
        tips["vocabulary_tip"] = (
            "Remember to say '" + missing[0] + "' — it's a key word."
        )
    else:
        tips["vocabulary_tip"] = "Great word choice!"

    # Natural English — remove extras / use the natural word.
    if extra:
        tips["natural_english_tip"] = (
            "Remove " + _join(extra, 2) + " to sound more natural."
        )
    elif incorrect:
        tips["natural_english_tip"] = (
            "'" + incorrect[0]["target"] + "' sounds more natural than '" + incorrect[0]["spoken"] + "'."
        )
    else:
        tips["natural_english_tip"] = "That sounds natural and fluent!"

    # Confidence — calibrated to the similarity band.
    if sim < 0.5:
        tips["confidence_tip"] = (
            "Slow down and speak each word with confidence — you've got this!"
        )
    elif sim < 0.8:
        tips["confidence_tip"] = "You're close! A bit more confidence and you'll nail it."
    else:
        tips["confidence_tip"] = "Confident delivery — well done!"

    # Speaking — reference the word tally.
    if t_count > 1 and correct < t_count:
        tips["speaking_tip"] = (
            "You got " + str(correct) + " of " + str(t_count) + " words right. Listen again and repeat."
        )
    elif extra:
        tips["speaking_tip"] = "Try to say only the target words — no extras."
    else:
        tips["speaking_tip"] = "Excellent! Try the next one at a slightly faster pace."

    return tips


def _summary_from_diff(sim, diff):
    """Encouraging one-line summary that references the actual word tally."""
    correct = diff["correct_count"]
    t_count = diff["target_count"]
    if t_count == 0:
        return "Let's try that again."
    if correct == t_count and not diff["extra_words"]:
        return "Perfect! You said every word correctly."
    if sim >= 0.85:
        return "Great job! You got " + str(correct) + " of " + str(t_count) + " words right."
    if sim >= 0.6:
        return (
            "Good effort — "
            + str(correct)
            + " of "
            + str(t_count)
            + " words matched. Keep practicing!"
        )
    if sim >= 0.35:
        return (
            "You matched "
            + str(correct)
            + " of "
            + str(t_count)
            + " words. Slow down and try again."
        )
    return "Don't give up! Listen to the target, then say it slowly."
