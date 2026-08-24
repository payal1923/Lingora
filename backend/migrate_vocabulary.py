"""
Idempotent migration script for the Vocabulary module upgrade.

- Adds new columns to the existing `vocabulary` table.
- Adds new columns to the existing `learned_words` table.
- Creates the new `favorite_words` table.

Safe to run multiple times: it checks whether each column/table already
exists before attempting to add/create it.
"""
import sys
import os

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from sqlalchemy import inspect, text
from database import engine, Base, SessionLocal

# Import models so Base.metadata knows about them
import models_vocabulary
import models_learned
import models_favorite


def column_exists(table_name, column_name):
    insp = inspect(engine)
    columns = [c["name"] for c in insp.get_columns(table_name)]
    return column_name in columns


def table_exists(table_name):
    insp = inspect(engine)
    return table_name in insp.get_table_names()


def add_column(table_name, column_name, column_type):
    if column_exists(table_name, column_name):
        print(f"  - {table_name}.{column_name} already exists, skipping")
        return
    with engine.begin() as conn:
        conn.execute(
            text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
        )
    print(f"  + {table_name}.{column_name} added ({column_type})")


def main():
    print("=== Vocabulary Module Migration ===")

    # --------------------------------------------------
    # vocabulary table: new columns
    # --------------------------------------------------
    print("\n[1/3] Upgrading `vocabulary` table...")
    vocab_columns = {
        "pronunciation": "VARCHAR",
        "part_of_speech": "VARCHAR",
        "example2": "VARCHAR",
        "synonyms": "VARCHAR",
        "antonyms": "VARCHAR",
        "ai_tip": "TEXT",
        "common_mistakes": "TEXT",
        "when_to_use": "TEXT",
        "when_not_to_use": "TEXT",
        "natural_sentence": "TEXT",
        "formal_sentence": "TEXT",
        "informal_sentence": "TEXT",
        "difficulty": "VARCHAR DEFAULT 'Beginner'",
        "category": "VARCHAR DEFAULT 'Daily Life'",
        "xp_reward": "INTEGER DEFAULT 10",
        "normalized_word": "VARCHAR",
    }
    for col, col_type in vocab_columns.items():
        add_column("vocabulary", col, col_type)

    # --------------------------------------------------
    # learned_words table: new columns
    # --------------------------------------------------
    print("\n[2/3] Upgrading `learned_words` table...")
    learned_columns = {
        "status": "VARCHAR DEFAULT 'Learning'",
        "review_interval_days": "INTEGER DEFAULT 1",
        "next_review": "DATE",
        "last_reviewed": "DATE",
        "review_count": "INTEGER DEFAULT 0",
    }
    for col, col_type in learned_columns.items():
        add_column("learned_words", col, col_type)

    # --------------------------------------------------
    # favorite_words table: create if missing
    # --------------------------------------------------
    print("\n[3/3] Ensuring `favorite_words` table exists...")
    if table_exists("favorite_words"):
        print("  - favorite_words already exists, skipping")
    else:
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    CREATE TABLE favorite_words (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(id),
                        vocabulary_id INTEGER REFERENCES vocabulary(id)
                    )
                    """
                )
            )
        print("  + favorite_words table created")

    # Backfill status for existing learned rows that have NULL status
    print("\n[Backfill] Setting NULL status to 'Learning'...")
    db = SessionLocal()
    try:
        db.execute(
            text(
                "UPDATE learned_words SET status = 'Learning' WHERE status IS NULL"
            )
        )
        db.execute(
            text(
                "UPDATE learned_words SET review_count = 0 WHERE review_count IS NULL"
            )
        )
        db.execute(
            text(
                "UPDATE learned_words SET review_interval_days = 1 "
                "WHERE review_interval_days IS NULL"
            )
        )
        db.commit()
        print("  + Backfill complete")
    finally:
        db.close()

    # Backfill normalized_word for existing vocabulary rows
    print("\n[Backfill] Populating normalized_word for vocabulary...")
    db = SessionLocal()
    try:
        db.execute(
            text(
                "UPDATE vocabulary "
                "SET normalized_word = LOWER(TRIM(word)) "
                "WHERE normalized_word IS NULL"
            )
        )
        db.commit()
        print("  + normalized_word backfill complete")
    finally:
        db.close()

    # Create unique index on normalized_word if it does not exist
    print("\n[Index] Creating unique index on vocabulary.normalized_word...")
    with engine.begin() as conn:
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "uq_vocabulary_normalized_word "
                "ON vocabulary (normalized_word)"
            )
        )
    print("  + Unique index created")

    # --------------------------------------------------
    # vocabulary_search_history table
    # --------------------------------------------------
    print("\n[4/4] Ensuring `vocabulary_search_history` table exists...")
    if table_exists("vocabulary_search_history"):
        print("  - vocabulary_search_history already exists, skipping")
    else:
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    CREATE TABLE vocabulary_search_history (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(id),
                        vocabulary_id INTEGER REFERENCES vocabulary(id),
                        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )
            conn.execute(
                text(
                    "CREATE UNIQUE INDEX IF NOT EXISTS "
                    "uq_vocabulary_search_history_user_vocab "
                    "ON vocabulary_search_history (user_id, vocabulary_id)"
                )
            )
        print("  + vocabulary_search_history table created")

    print("\n=== Migration complete ===")


if __name__ == "__main__":
    main()
