function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function getQuestions() {

    fetch('/questions')
        .then(response => response.json())
        .then(data => {
            return data.filter(
                d => {
                    if( d.q_type === "matching") return true;
                    return false
                }
            )
        })
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
    else if (question.q_type === "matching") renderMatchingAnswer(question)

}

function renderSelect(question){
    let container = document.getElementById('answerContainer');
    container.innerHTML=''
    let answers = shuffle(question.answers)

    for (let n in answers){
        let labelElement = document.createElement('label')
        labelElement.innerText=answers[n]
        let inputElement = document.createElement('input')
        inputElement.type = 'checkbox'
        inputElement.value = answers[n]
        labelElement.appendChild(inputElement)
        container.appendChild(labelElement)
        container.appendChild(document.createElement('br'))


    }
    renderAnswerButton(() => processSelect(question))


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

 function renderMatchingAnswer(question) {
     let container = document.getElementById('answerContainer')
     container.innerHTML=''
     let titles = [];
     let variants = []
     question.answers.forEach(
         ans => {
             let splitted = ans.split(":::")
             titles.push(splitted[0])
             variants.push(splitted[1])
         }
     )

     for (let n in titles){
         let labelElem = document.createElement('label')
         labelElem.innerText = titles[n]
         let selectElem = document.createElement('select')
         for (let nn in variants){

             let optionElem = document.createElement('option')
             optionElem.value = titles[n]
             optionElem.textContent = variants[nn]
             selectElem.appendChild(optionElem)

         }
         labelElem.appendChild(selectElem)
         container.appendChild(document.createElement('br'))
         container.appendChild(labelElem)

     }
     renderAnswerButton(() => processMatchingAnswer(question))


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

function processMatchingAnswer(question){

    let container = document.getElementById('answerContainer');

    let selects = container.querySelectorAll('select')
    console.log(selects)
    let userAnswer = []
    selects.forEach(
        sel => {
            let value = sel.value;
            let text = sel.options[sel.selectedIndex].text;
            userAnswer.push(`${value}:::${text}`)
        }
)

    sendAnswer(question, userAnswer)

}


function processFreeAnswer(question){

    let container = document.getElementById('answerContainer');

    let userAnswer = [document.getElementById('answer').value]

    sendAnswer(question, userAnswer)


}




function sendAnswer(question, userAnswer) {
    console.log(userAnswer)
    console.log(question.right_answers)

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

