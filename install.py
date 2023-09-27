import sqlite3
import json

SQLS = [

    """CREATE TABLE IF NOT EXISTS questions (
        
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        answers TEXT,
        right_answers TEXT,
        image TEXT
    )""",

    """
    CREATE TABLE IF NOT EXISTS questions_answers_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        profile TEXT,
        is_correct BOOL,
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )
    
    """

]

db = sqlite3.connect("data.db")

cursor = db.cursor()

for sql in SQLS:
    cursor.execute(sql)


with open('questions.json', encoding='utf-8') as f:
    questions = json.loads(f.read())
    for question in questions:
        title = question['title']
        answers = question['answers']
        right_answers = question['rightAnswers']
        image = question['image']

       # print(title, answers, right_answers, image)

        cursor.execute(
            f"""
                INSERT INTO questions (title, answers, right_answers, image) 
                VALUES (?, ?, ?, ?)
            """,
            (title, json.dumps(answers), json.dumps(right_answers), image),
        )

    db.commit()


cursor.close()
db.close()
