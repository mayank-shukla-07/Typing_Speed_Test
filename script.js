const quotes = {
  easy: [
    "Practice typing daily.", "I love to code.", "This is fun.", "You are fast.",
    "Be your best.", "Code every day.", "Fast hands win.", "Never give up.",
    "Stay on track.", "Type with joy.", "Small steps count.", "Think and type.",
    "Keep it simple.", "Try again now.", "Push your limits."
  ],
  medium: [
    "Typing is a skill that improves with practice.",
    "The quick brown fox jumps over the lazy dog.",
    "Coding is fun when you understand it well.",
    "Always challenge yourself to learn something new.",
    "Creativity and consistency make great developers.",
    "Great things take time and persistence.",
    "A clean codebase is easier to maintain.",
    "Speed comes naturally with consistent effort.",
    "Focus on accuracy before increasing speed.",
    "Typing without looking takes discipline and time.",
    "Break complex tasks into manageable chunks.",
    "Stay calm and type on.", "Practice makes permanent.",
    "Mistakes help you grow.",
    "A goal without a plan is just a wish."
  ],
  hard: [
    "The key to mastery lies in focused repetition and continuous learning.",
    "JavaScript allows you to create interactive web experiences with ease.",
    "Typing at high speed with great accuracy is a valuable productivity skill.",
    "The ability to debug efficiently separates good coders from great ones.",
    "Understanding the event loop is crucial for mastering asynchronous programming.",
    "Attention to detail distinguishes an average developer from a great one.",
    "Nested callbacks can lead to callback hell without proper structuring.",
    "Typing with proper posture reduces fatigue and improves endurance.",
    "Asynchronous programming improves responsiveness and performance in applications.",
    "Consistent formatting and naming conventions enhance code readability.",
    "A strong foundation in algorithms improves overall problem-solving abilities.",
    "Typing fluently allows you to focus on logic, not syntax.",
    "Every keystroke is a step closer to fluency and confidence.",
    "Mastering hotkeys boosts your development speed significantly.",
    "Efficient code and efficient typing go hand in hand."
  ]
};

const quoteDisplay = document.getElementById("quoteDisplay");
const quoteInput = document.getElementById("quoteInput");
const timer = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const errorsDisplay = document.getElementById("errors");
const restartBtn = document.getElementById("restartBtn");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const difficultySelect = document.getElementById("difficulty");
const successMessage = document.getElementById("successMessage");
const progressBar = document.getElementById("progressBar");
const strictModeCheckbox = document.getElementById("strictMode");

let startTime, interval, currentQuote = "", totalErrors = 0;
let currentPosition = 0, isTestComplete = false;
let totalTypedChars = 0;

function getRandomQuote(difficulty) {
  const quoteList = quotes[difficulty];
  return quoteList[Math.floor(Math.random() * quoteList.length)];
}

function renderNewQuote() {
  const selectedDifficulty = difficultySelect.value;
  currentQuote = getRandomQuote(selectedDifficulty);
  quoteDisplay.innerHTML = "";

  currentQuote.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.innerText = char;
    if (index === 0) span.classList.add("current");
    quoteDisplay.appendChild(span);
  });

  resetGame();
}

function resetGame() {
  quoteInput.value = "";
  clearInterval(interval);
  timer.innerText = "0";
  wpmDisplay.innerText = "0";
  accuracyDisplay.innerText = "100%";
  errorsDisplay.innerText = "0";
  progressBar.style.width = "0%";
  successMessage.classList.add("hidden");
  totalErrors = 0;
  currentPosition = 0;
  totalTypedChars = 0;
  startTime = null;
  isTestComplete = false;
  quoteInput.focus();
}

function updateProgress() {
  const progress = (currentPosition / currentQuote.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function calculateWPM(characters, timeInMinutes) {
  return Math.round((characters / 5) / timeInMinutes);
}

function updateCurrentCharacter() {
  const spans = quoteDisplay.querySelectorAll("span");
  spans.forEach((span, index) => {
    span.classList.remove("current");
    if (index === currentPosition) span.classList.add("current");
  });
}

quoteInput.addEventListener("input", (e) => {
  if (isTestComplete) return;

  const inputValue = e.target.value;
  const inputLength = inputValue.length;

  if (!startTime && inputLength > 0) {
    startTime = new Date();
    interval = setInterval(() => {
      timer.innerText = Math.floor((new Date() - startTime) / 1000);
    }, 1000);
  }

  const spans = quoteDisplay.querySelectorAll("span");

  if (strictModeCheckbox.checked) {
    let hasError = false;
    for (let i = 0; i < inputLength; i++) {
      if (inputValue[i] !== currentQuote[i]) {
        hasError = true;
        break;
      }
    }
    if (hasError) {
      e.target.value = inputValue.slice(0, -1);
      totalErrors++;
      return;
    }
  }

  // Track total characters typed (including errors)
  if (inputLength > totalTypedChars) {
    totalTypedChars = inputLength;
  }

  spans.forEach((span, index) => {
    span.classList.remove("correct", "incorrect", "current");
  });

  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < spans.length; i++) {
    const inputChar = inputValue[i];
    const span = spans[i];

    if (inputChar == null) {
      if (i === inputLength) span.classList.add("current");
    } else if (inputChar === span.innerText) {
      span.classList.add("correct");
      correctChars++;
    } else {
      span.classList.add("incorrect");
      incorrectChars++;
    }
  }

  currentPosition = inputLength;
  updateProgress();

  // Count errors properly
  if (incorrectChars > 0) {
    totalErrors = Math.max(totalErrors, incorrectChars);
  }

  if (startTime) {
    const timeInMinutes = Math.max((new Date() - startTime) / 60000, 0.01);
    wpmDisplay.innerText = calculateWPM(correctChars, timeInMinutes);
    
    // Accuracy calculation
    const accuracy = totalTypedChars > 0 ? Math.round(((totalTypedChars - totalErrors) / totalTypedChars) * 100) : 100;
    accuracyDisplay.innerText = `${Math.max(0, accuracy)}%`;
    errorsDisplay.innerText = totalErrors;
  }

  if (inputValue === currentQuote) {
    clearInterval(interval);
    successMessage.classList.remove("hidden");
    isTestComplete = true;
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.key === "Escape") || (e.ctrlKey && ["n", "s"].includes(e.key))) {
    e.preventDefault();
  }

  if (e.key === "Escape") {
    renderNewQuote();
  } else if (e.ctrlKey && e.key === "n") {
    renderNewQuote();
  } else if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    const options = Array.from(difficultySelect.options);
    const nextIndex = (options.findIndex(o => o.selected) + 1) % options.length;
    difficultySelect.selectedIndex = nextIndex;
    renderNewQuote();
  } else if (e.ctrlKey && e.key === "s") {
    strictModeCheckbox.checked = !strictModeCheckbox.checked;
  }
});

quoteInput.addEventListener("keydown", (e) => {
  if (e.key === "Backspace" && !strictModeCheckbox.checked) {
    setTimeout(() => {
      currentPosition = quoteInput.value.length;
      updateCurrentCharacter();
      updateProgress();
    }, 0);
  }
});

restartBtn.addEventListener("click", renderNewQuote);
newQuoteBtn.addEventListener("click", renderNewQuote);
difficultySelect.addEventListener("change", renderNewQuote);

renderNewQuote();