import json
import sqlite3
from model import Question, determine_question_type

class Storage:
    db_path = 'data.db'
    conn = None

    def __enter__(self):
        self.conn = sqlite3.connect(self.db_path)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()

    def get_connection(self):
        return self.conn

    def commit(self):
        if self.conn:
            self.conn.commit()

    def get_questions(self):

        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM questions")

        raw_data = cursor.fetchall()
        questions = []

        for row in raw_data:
            q = self.question_from_row(row)
            questions.append(q)
        return questions

    def get_question(self, question_id):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
        raw_data = cursor.fetchall()
        for row in raw_data:
            return self.question_from_row(row)


    def get_incorrect_answered_questions(self, profile):

        cursor = self.conn.cursor()
        cursor.execute("""
        SELECT * FROM questions JOIN questions_answers_history ON questions.id = questions_answers_history.question_id WHERE profile = ? AND is_correct = FALSE GROUP BY questions.id
        """, (profile,))
        raw_data = cursor.fetchall()
        questions = []
        for row in raw_data:
            q = self.question_from_row(row)

            questions.append(q)
        return questions


    def question_from_row(self, row):
        answers = json.loads(row[2])
        right_answers = json.loads(row[3])
        return Question(
            id=int(row[0]),
            title=row[1],
            answers=answers,
            right_answers=right_answers,
            image=row[4],
            q_type=determine_question_type(answers, right_answers)
        )

