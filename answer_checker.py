from dataclasses import dataclass

from model import Question
from storage import Storage



@dataclass
class AnswerChecker:
    question: Question
    user_answer: list[str]
    profile: str

    def check(self):

        q_type = self.question.q_type
        if q_type == 'free-answer':
            is_correct = self.check_free_answer()
        else:
            is_correct = self.check_select_or_comparison_answer()

        self.record_answer(is_correct)
        return is_correct

    def check_free_answer(self):
        user_text = self.user_answer[0]
        if user_text in self.question.right_answers:
            return True
        return False

    def check_select_or_comparison_answer(self):

        return set(self.user_answer) == set(self.question.right_answers)

    def record_answer(self, is_correct):
        with Storage() as db:
            cursor = db.get_connection().cursor()
            cursor.execute("""INSERT INTO questions_answers_history (question_id, profile, is_correct) VALUES (?, ?, ?)""", (self.question.id, self.profile, is_correct))
            db.commit()


