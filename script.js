const apiURL = "questions.json"; 

let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let timer = null;
let timeLeft = 15;
let selectedCategory = "General";

const quiz = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const resultEl = document.getElementById("result");
const progressBar = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const questionCounter = document.getElementById("question-counter");
const categorySelect = document.getElementById("category-select");
const leaderboardEl = document.getElementById("leaderboard");

const correctSound = new Audio("https://cdn.pixabay.com/audio/2022/07/26/audio_124b7b2b7b.mp3");
const wrongSound = new Audio("https://cdn.pixabay.com/audio/2022/07/26/audio_124b7b2b7b.mp3");

async function loadCategory() {
  const res = await fetch(apiURL);
  const data = await res.json();
  questions = data[selectedCategory];

  currentQuestion = 0;
  score = 0;

  showQuestion();
  updateProgress();
  updateCounter();
  leaderboardEl.style.display = "none";
}

categorySelect.onchange = () => {
  selectedCategory = categorySelect.value;
  loadCategory();
};

function showQuestion() {
  answered = false;
  const q = questions[currentQuestion];

  questionEl.textContent = q.question;
  answersEl.innerHTML = "";
  resultEl.textContent = "";

  timeLeft = 15;
  timerEl.textContent = `Time left: ${timeLeft}s`;
  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      selectAnswer(-1);
    }
  }, 1000);

  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = () => selectAnswer(i, btn);
    answersEl.appendChild(btn);
  });

  nextBtn.style.display = "none";
  updateProgress();
  updateCounter();
}

function selectAnswer(selected, btn) {
  if (answered) return;
  answered = true;
  clearInterval(timer);

  const q = questions[currentQuestion];

  [...answersEl.children].forEach((b, idx) => {
    if (idx === q.correct) b.classList.add("correct");
    if (idx === selected && selected !== q.correct) b.classList.add("incorrect");
    b.disabled = true;
  });

  if (selected === q.correct) {
    score++;
    resultEl.textContent = "Correct!";
    resultEl.style.color = "#2ecc71";
    correctSound.play();
  } else {
    resultEl.textContent = `Wrong! Correct answer: ${q.answers[q.correct]}`;
    resultEl.style.color = "#e74c3c";
    wrongSound.play();
  }

  nextBtn.style.display = "block";
}

nextBtn.onclick = () => {
  currentQuestion++;
  currentQuestion < questions.length ? showQuestion() : showResult();
};

function updateProgress() {
  progressBar.style.width = `${(currentQuestion / questions.length) * 100}%`;
}

function updateCounter() {
  questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
}

function showResult() {
  saveScore(score, selectedCategory);

  quiz.innerHTML = `
    <h2>Quiz Complete!</h2>
    <p style="font-size:1.3em;color:#0066ff;">Score: <b>${score}/${questions.length}</b></p>
    <button id="review" class="action-btn">Review Answers</button>
    <button id="reload" class="action-btn" style="background:#008cff;">Play Again</button>
  `;

  document.getElementById("reload").onclick = () => window.location.reload();
  document.getElementById("review").onclick = showReview;

  showLeaderboard();
}

function showReview() {
  let html = `<h2>Review Answers</h2><ol>`;
  questions.forEach((q) => {
    html += `<li><b>${q.question}</b><br>Correct: <span style='color:#2ecc71;'>${q.answers[q.correct]}</span></li>`;
  });
  html += `</ol><button id="reload" class="action-btn">Play Again</button>`;
  quiz.innerHTML = html;

  document.getElementById("reload").onclick = () => window.location.reload();
  showLeaderboard();
}

function saveScore(score, category) {
  let scores = JSON.parse(localStorage.getItem("quiz_leaderboard") || "{}");
  if (!scores[category]) scores[category] = [];
  scores[category].push({ score, date: new Date().toLocaleString() });
  scores[category] = scores[category].slice(-5);
  localStorage.setItem("quiz_leaderboard", JSON.stringify(scores));
}

function showLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("quiz_leaderboard") || "{}");
  let list = scores[selectedCategory] || [];

  leaderboardEl.innerHTML = `
    <h3>Leaderboard (${selectedCategory})</h3>
    <ul>${list
      .slice()
      .reverse()
      .map((s) => `<li>${s.score}/${questions.length} - ${s.date}</li>`)
      .join("")}</ul>
  `;

  leaderboardEl.style.display = "block";
}

window.onload = async () => {
  const res = await fetch(apiURL);
  const data = await res.json();

  Object.keys(data).forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  loadCategory();
  nextBtn.style.display = "none";
};

