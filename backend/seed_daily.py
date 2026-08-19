from database import SessionLocal
from models_daily import DailyQuestion

db = SessionLocal()


questions = [
    {
        "question": "Choose the correct sentence.",
        "option1": "He go to school.",
        "option2": "He goes to school.",
        "option3": "He going school.",
        "option4": "He gone school.",
        "answer": "He goes to school.",
    },
    {
        "question": "What is the synonym of 'Happy'?",
        "option1": "Sad",
        "option2": "Angry",
        "option3": "Joyful",
        "option4": "Weak",
        "answer": "Joyful",
    },
    {
        "question": "Choose the correct article.",
        "option1": "a apple",
        "option2": "an apple",
        "option3": "the apple",
        "option4": "no article",
        "answer": "an apple",
    },
    {
        "question": "Which word is a verb?",
        "option1": "Beautiful",
        "option2": "Run",
        "option3": "Blue",
        "option4": "Table",
        "answer": "Run",
    },
    {
        "question": "Complete the sentence: She _____ English every day.",
        "option1": "study",
        "option2": "studies",
        "option3": "studying",
        "option4": "studied",
        "answer": "studies",
    },
    {
        "question": "Choose the past tense of 'go'.",
        "option1": "goed",
        "option2": "going",
        "option3": "went",
        "option4": "gone",
        "answer": "went",
    },
    {
        "question": "Which word is an adjective?",
        "option1": "Quickly",
        "option2": "Beautiful",
        "option3": "Run",
        "option4": "Speak",
        "answer": "Beautiful",
    },
    {
        "question": "Choose the correct sentence.",
        "option1": "I am learning English.",
        "option2": "I learning English.",
        "option3": "I learns English.",
        "option4": "I learned English every now.",
        "answer": "I am learning English.",
    },
    {
        "question": "What is the opposite of 'Big'?",
        "option1": "Large",
        "option2": "Huge",
        "option3": "Small",
        "option4": "Tall",
        "answer": "Small",
    },
    {
        "question": "Choose the correct spelling.",
        "option1": "Beautifull",
        "option2": "Beutiful",
        "option3": "Beautiful",
        "option4": "Beautifullness",
        "answer": "Beautiful",
    },
]


for q in questions:

    daily_question = DailyQuestion(
        question=q["question"],
        option1=q["option1"],
        option2=q["option2"],
        option3=q["option3"],
        option4=q["option4"],
        answer=q["answer"],
    )

    db.add(daily_question)


db.commit()

db.close()


print("Daily questions added successfully 🚀")
