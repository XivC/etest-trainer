import json
import sqlite3
from model import Question


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
            q = Question(
                id=int(row[0]),
                title=row[1],
                answers=json.loads(row[2]),
                right_answers=json.loads(row[3]),
                image=row[4],
            )

            questions.append(q)
        return questions

    def get_question(self, question_id):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
        raw_data = cursor.fetchall()
        for row in raw_data:
            return Question(
                id=int(row[0]),
                title=row[1],
                answers=json.loads(row[2]),
                right_answers=json.loads(row[3]),
                image=row[4],
            )


