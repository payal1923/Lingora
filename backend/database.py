from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:bappa%401906@localhost:5432/lingora"

engine = create_engine(DATABASE_URL)

try:
    connection = engine.connect()
    print("✅ Database Connected Successfully!")
    connection.close()
except Exception as e:
    print("❌ Database Connection Failed")
    print(e)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
