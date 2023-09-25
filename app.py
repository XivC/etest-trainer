# -*- coding: utf-8 -*-
import json
from dataclasses import asdict

from flask import Flask, render_template, Response, request

from answer_checker import AnswerChecker
from rest import *
from storage import Storage

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/questions', methods=['get'])
def get_questions():

    with Storage() as db:
        questions = db.get_questions()
        return json.dumps([asdict(q) for q in questions]).encode('utf-8')


@app.route('/questions/<question_id>', methods=['get'])
def get_question(question_id):
    with Storage() as db:
        question = db.get_question(int(question_id))
        if not question:
            return Response(status=404)
    return json.dumps(asdict(question), ensure_ascii=False).encode('utf-8')



@app.route('/questions/<question_id>/answer', methods=['post'])
def answer(question_id):

    with Storage() as db:
        question = db.get_question(int(question_id))
        if not question:
            return Response(status=404)

        data = request.get_json()
        checker = AnswerChecker(
            question=question,
            user_answer=data['userAnswer'],
            profile=data['profile'],
        )
        return {
            'isCorrect': checker.check(),
        }



if __name__ == '__main__':
    app.run(port=8080, debug=True)