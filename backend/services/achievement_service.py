from models_achievement import Achievement
from models_result import QuizResult
from models_learned import LearnedWord


def unlock_achievements(db, user):

    badges = []

    # ------------------------------
    # First Challenge
    # ------------------------------

    total_quizzes = db.query(QuizResult).filter(QuizResult.user_id == user.id).count()

    if total_quizzes >= 1:

        badges.append(("First Challenge", "🎯"))

    # ------------------------------
    # 100 XP Club
    # ------------------------------

    if user.xp >= 100:

        badges.append(("100 XP Club", "⭐"))

    # ------------------------------
    # Level 5
    # ------------------------------

    if user.level >= 5:

        badges.append(("Level 5", "🚀"))

    # ------------------------------
    # 7 Day Streak
    # ------------------------------

    if user.streak >= 7:

        badges.append(("7 Day Streak", "🔥"))

    # ------------------------------
    # Vocabulary Master
    # ------------------------------

    learned = db.query(LearnedWord).filter(LearnedWord.user_id == user.id).count()

    if learned >= 100:

        badges.append(("Vocabulary Master", "📚"))

    # ------------------------------
    # Lingora Champion
    # ------------------------------

    if user.level >= 10:

        badges.append(("Lingora Champion", "👑"))

    # ------------------------------
    # Save New Badges
    # ------------------------------

    unlocked = []

    for badge_name, badge_icon in badges:

        exists = (
            db.query(Achievement)
            .filter(
                Achievement.user_id == user.id,
                Achievement.badge_name == badge_name,
            )
            .first()
        )

        if exists:
            continue

        achievement = Achievement(
            user_id=user.id,
            badge_name=badge_name,
            badge_icon=badge_icon,
        )

        db.add(achievement)

        unlocked.append(
            {
                "badge_name": badge_name,
                "badge_icon": badge_icon,
            }
        )

    db.commit()

    return unlocked
