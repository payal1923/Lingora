"""Seed the Lingora English-learning curriculum.

The seed is idempotent: lesson orders that already exist are left unchanged,
and only missing lessons are inserted. All inserts are committed as one
transaction after the complete seed operation succeeds.
"""
from database import SessionLocal
from models_lesson import Lesson


LESSONS = [
    {
        "title": "Introducing Yourself",
        "description": "Learn useful words and simple sentences for sharing your name, country, and basic information.",
        "level": "Beginner",
        "lesson_order": 1,
        "xp_reward": 20,
    },
    {
        "title": "The Verb To Be",
        "description": "Practice am, is, and are in positive sentences, questions, and short answers.",
        "level": "Beginner",
        "lesson_order": 2,
        "xp_reward": 20,
    },
    {
        "title": "Everyday Objects and Vocabulary",
        "description": "Build practical vocabulary for common objects at home, at school, and at work.",
        "level": "Beginner",
        "lesson_order": 3,
        "xp_reward": 20,
    },
    {
        "title": "Simple Present for Daily Routines",
        "description": "Describe habits and routines using the simple present and correct third-person forms.",
        "level": "Beginner",
        "lesson_order": 4,
        "xp_reward": 20,
    },
    {
        "title": "Forming Clear English Sentences",
        "description": "Use subject, verb, and object order to create clear and complete English sentences.",
        "level": "Beginner",
        "lesson_order": 5,
        "xp_reward": 20,
    },
    {
        "title": "Asking Questions",
        "description": "Ask and answer everyday yes-or-no and wh- questions with do, does, and be.",
        "level": "Beginner",
        "lesson_order": 6,
        "xp_reward": 20,
    },
    {
        "title": "Time, Dates, and Schedules",
        "description": "Talk about clock time, days, dates, appointments, and simple schedules.",
        "level": "Beginner",
        "lesson_order": 7,
        "xp_reward": 20,
    },
    {
        "title": "Shopping and Prices",
        "description": "Use polite shopping phrases to ask about prices, sizes, colors, and availability.",
        "level": "Beginner",
        "lesson_order": 8,
        "xp_reward": 20,
    },
    {
        "title": "Food and Ordering at a Restaurant",
        "description": "Learn food vocabulary and practice ordering meals, making requests, and paying the bill.",
        "level": "Beginner",
        "lesson_order": 9,
        "xp_reward": 20,
    },
    {
        "title": "Getting Around Town",
        "description": "Understand directions and use practical language for places, transport, and navigation.",
        "level": "Beginner",
        "lesson_order": 10,
        "xp_reward": 20,
    },
    {
        "title": "Past Experiences",
        "description": "Talk about completed actions and personal experiences using regular and common irregular past verbs.",
        "level": "Intermediate",
        "lesson_order": 11,
        "xp_reward": 25,
    },
    {
        "title": "Future Plans and Predictions",
        "description": "Discuss plans, arrangements, promises, and predictions with will and going to.",
        "level": "Intermediate",
        "lesson_order": 12,
        "xp_reward": 25,
    },
    {
        "title": "Present Perfect in Real Conversation",
        "description": "Connect past actions to the present while practicing just, already, yet, and ever.",
        "level": "Intermediate",
        "lesson_order": 13,
        "xp_reward": 25,
    },
    {
        "title": "Comparisons and Opinions",
        "description": "Compare people, places, and choices and explain opinions with clear supporting reasons.",
        "level": "Intermediate",
        "lesson_order": 14,
        "xp_reward": 25,
    },
    {
        "title": "Modal Verbs for Advice and Ability",
        "description": "Use can, could, should, must, and have to for ability, advice, permission, and obligation.",
        "level": "Intermediate",
        "lesson_order": 15,
        "xp_reward": 25,
    },
    {
        "title": "Workplace and Study Communication",
        "description": "Write and say useful phrases for meetings, classrooms, teamwork, and asking for clarification.",
        "level": "Intermediate",
        "lesson_order": 16,
        "xp_reward": 25,
    },
    {
        "title": "Polite Requests and Problem Solving",
        "description": "Handle everyday problems politely by making requests, explaining issues, and suggesting solutions.",
        "level": "Intermediate",
        "lesson_order": 17,
        "xp_reward": 25,
    },
    {
        "title": "Connecting Ideas Naturally",
        "description": "Build longer sentences with because, although, however, so, and other useful linking words.",
        "level": "Intermediate",
        "lesson_order": 18,
        "xp_reward": 25,
    },
    {
        "title": "Travel and Real-World Conversations",
        "description": "Practice conversations for checking in, asking for help, handling delays, and making travel plans.",
        "level": "Intermediate",
        "lesson_order": 19,
        "xp_reward": 25,
    },
    {
        "title": "Fluent Everyday Conversations",
        "description": "Combine grammar, vocabulary, and conversation strategies to speak more naturally in daily situations.",
        "level": "Intermediate",
        "lesson_order": 20,
        "xp_reward": 25,
    },
]


def seed_lessons():
    db = SessionLocal()
    try:
        existing_orders = {
            lesson_order
            for (lesson_order,) in db.query(Lesson.lesson_order).filter(
                Lesson.lesson_order.in_(lesson["lesson_order"] for lesson in LESSONS)
            ).all()
        }

        new_lessons = [
            Lesson(**lesson)
            for lesson in LESSONS
            if lesson["lesson_order"] not in existing_orders
        ]

        db.add_all(new_lessons)
        db.commit()
        return len(new_lessons)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    inserted_count = seed_lessons()
    print(f"Inserted {inserted_count} lessons successfully.")
