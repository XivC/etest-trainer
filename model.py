from dataclasses import dataclass


@dataclass
class Question:
    id: int
    title: str
    answers: list
    right_answers: list
    image: str