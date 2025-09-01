
const questionsData = {
  General: [
    {
      question: "What is the capital of India?",
      answers: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
      correct: 0
    },
    {
      question: "Who invented the World Wide Web?",
      answers: ["Tim Berners-Lee", "Bill Gates", "Steve Jobs", "Mark Zuckerberg"],
      correct: 0
    },
    {
      question: "Which is the largest planet in our solar system?",
      answers: ["Earth", "Venus", "Jupiter", "Mars"],
      correct: 2
    },
    {
      question: "Which year did the Berlin Wall fall?",
      answers: ["1987", "1989", "1991", "1995"],
      correct: 1
    }
  ],
  Science: [
    {
      question: "What is H2O commonly known as?",
      answers: ["Oxygen", "Hydrogen", "Water", "Salt"],
      correct: 2
    },
    {
      question: "What planet is known as the Red Planet?",
      answers: ["Mars", "Jupiter", "Saturn", "Venus"],
      correct: 0
    },
    {
      question: "What is the speed of light?",
      answers: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "3,000 km/s"],
      correct: 0
    }
  ],
  History: [
    {
      question: "Who was the first President of the USA?",
      answers: ["Abraham Lincoln", "George Washington", "John Adams", "Thomas Jefferson"],
      correct: 1
    },
    {
      question: "In which year did World War II end?",
      answers: ["1942", "1945", "1948", "1950"],
      correct: 1
    }
  ]
};

let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let timer = null;
let timeLeft = 15;
let reviewMode = false;
let selectedCategory = 'General';

const quiz = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');
const progressBar = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const questionCounter = document.getElementById('question-counter');
const categorySelect = document.getElementById('category-select');
const leaderboardEl = document.getElementById('leaderboard');

const correctSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124b7b2b7b.mp3');
const wrongSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124b7b2b7b.mp3');

function loadCategory() {
  questions = questionsData[selectedCategory];
  currentQuestion = 0;
  score = 0;
  reviewMode = false;
  showQuestion(currentQuestion);
  updateProgress();
  updateCounter();
  leaderboardEl.style.display = 'none';
}

categorySelect.onchange = function() {
  selectedCategory = categorySelect.value;
  loadCategory();
};

function showQuestion(qIndex) {
  answered = false;
  let q = questions[qIndex];
  questionEl.textContent = q.question;
  answersEl.innerHTML = '';
  resultEl.textContent = '';
  timerEl.textContent = `Time left: ${timeLeft}s`;
  if (timer) clearInterval(timer);
  timeLeft = 15;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      selectAnswer(-1, null);
    }
  }, 1000);
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.textContent = ans;
    btn.onclick = () => selectAnswer(i, btn);
    answersEl.appendChild(btn);
  });
  nextBtn.style.display = 'none';
  updateProgress();
  updateCounter();
}

function selectAnswer(selected, btn) {
  if (answered) return;
  answered = true;
  clearInterval(timer);
  const q = questions[currentQuestion];
  Array.from(answersEl.children).forEach((b, idx) => {
    if (idx === q.correct) b.classList.add('correct');
    else if (idx === selected) b.classList.add('incorrect');
    b.disabled = true;
  });
  if (selected === q.correct) {
    score++;
    resultEl.textContent = "Correct!";
    resultEl.style.color = "#388e3c";
    correctSound.play();
  } else {
    resultEl.textContent = "Wrong! The right answer is: " + q.answers[q.correct];
    resultEl.style.color = "#d84315";
    wrongSound.play();
  }
  nextBtn.style.display = 'block';
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(currentQuestion);
  } else {
    showResult();
  }
};

function updateProgress() {
  const percent = ((currentQuestion) / questions.length) * 100;
  progressBar.style.width = percent + '%';
}

function updateCounter() {
  questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
}

function showResult() {
  saveScore(score, selectedCategory);
  quiz.innerHTML = `<h2 style="margin-bottom:0.7em;">Quiz Complete!</h2>
    <p style="font-size:1.28em; color:#283593; margin-bottom:0.8em;">Your Score: <b>${score}/${questions.length}</b></p>
    <button id="review" style="background:#43e97b;color:#fff;padding:0.85em 1.5em;border:none;border-radius:0.55em;font-size:1em;font-weight:bold;cursor:pointer;box-shadow:0 2px 7px rgba(90,50,124,0.12);">Review Answers</button>
    <button id="reload" style="background:#00c6ff;color:#fff;padding:0.85em 1.5em;border:none;border-radius:0.55em;font-size:1em;font-weight:bold;cursor:pointer;box-shadow:0 2px 7px rgba(90,50,124,0.12);margin-left:1em;">Play Again</button>`;
  document.getElementById('reload').onclick = () => window.location.reload();
  document.getElementById('review').onclick = showReview;
  showLeaderboard();
}

function showReview() {
  reviewMode = true;
  let html = `<h2>Review Answers</h2><ol style='text-align:left;'>`;
  questions.forEach((q, idx) => {
    html += `<li><b>${q.question}</b><br>Correct: <span style='color:#388e3c;'>${q.answers[q.correct]}</span></li>`;
  });
  html += `</ol><button id='reload' style='background:#00c6ff;color:#fff;padding:0.85em 1.5em;border:none;border-radius:0.55em;font-size:1em;font-weight:bold;cursor:pointer;box-shadow:0 2px 7px rgba(90,50,124,0.12);margin-top:1em;'>Play Again</button>`;
  quiz.innerHTML = html;
  document.getElementById('reload').onclick = () => window.location.reload();
  showLeaderboard();
}

function saveScore(score, category) {
  let scores = JSON.parse(localStorage.getItem('quiz_leaderboard') || '{}');
  if (!scores[category]) scores[category] = [];
  scores[category].push({ score, date: new Date().toLocaleString() });
  scores[category] = scores[category].slice(-5); // keep last 5
  localStorage.setItem('quiz_leaderboard', JSON.stringify(scores));
}

function showLeaderboard() {
  let scores = JSON.parse(localStorage.getItem('quiz_leaderboard') || '{}');
  let list = scores[selectedCategory] || [];
  let html = `<h3>Leaderboard (${selectedCategory})</h3><ul>`;
  list.slice().reverse().forEach(s => {
    html += `<li>${s.score}/${questions.length} - ${s.date}</li>`;
  });
  html += '</ul>';
  leaderboardEl.innerHTML = html;
  leaderboardEl.style.display = 'block';
}

// Initial setup
window.onload = function() {
  // Populate category select
  Object.keys(questionsData).forEach(cat => {
    let opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
  loadCategory();
  nextBtn.style.display = 'none';
};
