from dataclasses import dataclass

def determine_question_type(answers, right_answers) -> str:
    if ':::' in right_answers[0]:
        return 'matching'
    elif set(answers) == set(right_answers):
        return 'free-answer'

    return 'select'


@dataclass
class Question:
    id: int
    title: str
    answers: list
    right_answers: list
    image: str
    q_type: str
