function getQuestions() {

    fetch('/questions')
        .then(response => response.json())
        .then(data => localStorage.setItem("questions", JSON.stringify(data)))

    var ans_cnt = localStorage.getItem('answersCount')
    if (!ans_cnt) ans_cnt = 0
    else ans_cnt = parseInt(ans_cnt)
    localStorage.setItem('answersCount', ans_cnt)
}

function clearQuestionsCount() {
    localStorage.setItem('answersCount', 0);
}

function getIncorrectQuestions() {
    clearQuestionsCount();
    var profile = document.getElementById("profile").value;
    if (!profile) {
        console.error('No profile found');
        return;
    }

    fetch(`/questions/incorrect?profile=${profile}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem("questions", JSON.stringify(data));
                nextQuestion();  // Immediately load the first incorrect question
            } else {
                console.error('No incorrect questions found for this profile');
            }
        })
        .catch(error => console.error('Error fetching incorrect questions:', error));
}


function nextQuestion() {


    let questions = JSON.parse(localStorage.getItem("questions"))
    var ans_cnt = localStorage.getItem('answersCount')
    ans_cnt = parseInt(ans_cnt)

    let counterContainer = document.getElementById("counterContainer")
    counterContainer.innerHTML = ''
    let counterElem = document.createElement('h3')
    counterElem.innerText = `${ans_cnt}/${questions.length}`
    counterContainer.appendChild(counterElem)

    var target;

    for(let n in questions){
        if (parseInt(n) === ans_cnt) {target = questions[n]; break;}
    }
    ans_cnt++;
    if (ans_cnt === parseInt(questions.length)) ans_cnt = 0;
    localStorage.setItem('answersCount', ans_cnt)
    localStorage.setItem('question', JSON.stringify(target))
    renderQuestion(target);
    renderAnswers(target);

}

function renderQuestion(question){
    document.getElementById('imageContainer').innerHTML = ''
    if (question.image) {
        fetch(`/static/${question.image}`)
            .then(r => r.blob())
            .then(b => {
                    let url = URL.createObjectURL(b)
                    const imageElement = document.createElement('img');
                    imageElement.src = url;
                    let container = document.getElementById('imageContainer');
                    container.innerHTML = ''
                    document.getElementById('imageContainer').appendChild(imageElement);
                }
            )
    }
    let container = document.getElementById('titleContainer');
    const titleElement = document.createElement('h2')
    titleElement.innerText = question.title
    container.innerHTML = ''
    container.appendChild(titleElement)
    document.getElementById('rightAnswersContainer').innerHTML=''


}

function renderAnswers(question){

    if (question.q_type === "select") renderSelect(question)
    else if (question.q_type === "free-answer") renderFreeAnswer(question)

}

function renderSelect(question){
    let container = document.getElementById('answerContainer');
    container.innerHTML=''
    let answers = question.answers
    for (let n in answers){
        let labelElement = document.createElement('label')
        labelElement.innerText=answers[n]
        let inputElement = document.createElement('input')
        inputElement.type = 'checkbox'
        inputElement.value = answers[n]
        labelElement.appendChild(inputElement)
        container.appendChild(labelElement)
        container.appendChild(document.createElement('br'))

        renderAnswerButton(() => processSelect(question))

    }


}


function renderAnswerButton(callback){
    let answerButtonContainer = document.getElementById('answerButtonContainer')
    answerButtonContainer.innerHTML = ''
    let answerButton = document.createElement('button')
    answerButton.onclick = callback
    answerButton.innerText = 'Ответить'
    answerButtonContainer.appendChild(answerButton)
}

function processSelect(question){

    let container = document.getElementById('answerContainer');

    let selected = container.querySelectorAll('input[type=checkbox]:checked')
    let userAnswer = []
    for (let n in selected) {
        if (selected[n].value !== undefined) userAnswer.push(selected[n].value)
    }

    sendAnswer(question, userAnswer)


}


function renderFreeAnswer(question){
    let container = document.getElementById('answerContainer');
    container.innerHTML=''
    let labelElement = document.createElement('label')
    labelElement.innerText = 'Введи ответ'
    let inputElement = document.createElement('input')
    inputElement.type = 'text'
    inputElement.id = 'answer'
    labelElement.appendChild(inputElement)
    container.appendChild(labelElement)

    renderAnswerButton(() => processFreeAnswer(question))

}

function processFreeAnswer(question){

    let container = document.getElementById('answerContainer');

    let userAnswer = [document.getElementById('answer').value]

    sendAnswer(question, userAnswer)


}




function sendAnswer(question, userAnswer) {

    let profile = document.getElementById("profile").value
    const data = {
        profile: profile,
        userAnswer: userAnswer
    };

    const url = `questions/${question.id}/answer`;


    const headers = {
        'Content-Type': 'application/json',

    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // You can parse the response here if it's in JSON format
        })
        .then(data => {
            renderRightAnswers(question, data.isCorrect)
        })
        .catch(error => {
            console.error('Error:', error);
        });

}


function renderRightAnswers(question, isCorrect){
    let rightAnswersContainer = document.getElementById('rightAnswersContainer');
    rightAnswersContainer.innerHTML = ''


    for (let n in question.right_answers){
        let textElem = document.createElement('b')
        textElem.innerText = question.right_answers[n]
        textElem.style.color = isCorrect ? 'green': 'red'
        rightAnswersContainer.appendChild(textElem)
        rightAnswersContainer.appendChild(document.createElement('br'))
    }


}

