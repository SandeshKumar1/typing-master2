import sentences from "./words.js";


   //initilizing 

let selectedLevel = null;
let gameStarted = false;

let currentSentence = "";
let wordObjects = [];
let currentWordIndex = 0;

let startTime = null;
let totalTypedWords = 0;

let timeLeft = 60;
let timerInterval = null;

let score = 0;
let mistakes = 0;



// spliting  sentence & analyzing to make difficulty 
function number_of_words(sentence) {
  const words = sentence.split(" ");
  const total_words = words.length;
  const totalcharacters = words.reduce((sum, w) => sum + w.length, 0);
  const average_length_of_words = totalcharacters / total_words;
  return { total_words, average_length_of_words };
}

// decide difficulty
function categorizeSentence(sentence) {
  const { total_words, average_length_of_words } = number_of_words(sentence);
  if (total_words <= 4 && average_length_of_words <= 5) return "easy";
  if (total_words <= 8 && average_length_of_words <= 8) return "medium";
  return "hard";
}

// function to categorizing the sentences 
function categorizeAll(sentences) {
  const levels = { easy: [], medium: [], hard: [] };

  sentences.forEach(sentence => {
    const level = categorizeSentence(sentence);
    levels[level].push(sentence);
  });

  return levels;
}

const levels = categorizeAll(sentences);
//DOM
//all selectors
const container = document.getElementById("sentence-container");
const input = document.getElementById("user-input");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const mistakesDisplay = document.getElementById("mistakes");
const messageDisplay = document.getElementById("message");
//sound 
const correctSound = new Audio("sounds/correct3.mp3");
const wrongSound = new Audio("sounds/wrong2.mp3");
const gameover=new Audio("sounds/gameover.mp3")


//function to start the game 
function startTimer() {
  timeLeft = 60;
  timerDisplay.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      stopGame("Time's up!");
      gameover.play();
    }
  }, 1000);
}



function startGame(level) {

messageDisplay.textContent = "";
scoreDisplay.textContent = 0;
mistakesDisplay.textContent = 0;
timerDisplay.textContent = 30;

    score = 0;
    mistakes = 0;
    startTimer();

  selectedLevel = level;
  gameStarted = true;

  const list = levels[level];
  currentSentence = list[Math.floor(Math.random() * list.length)];

  wordObjects = currentSentence.split(" ").map(word => ({
    text: word,
    status: "pending",
    score: word.length
  }));

  currentWordIndex = 0;
  startTime = null;
  totalTypedWords = 0;

  input.value = "";
  document.getElementById("difficulty-popup").style.display = "none";

  renderWordBoxes();
  input.focus();
}
function stopGame(reason) {
  clearInterval(timerInterval);
  gameStarted = false;
  input.blur();

  messageDisplay.textContent = `${reason} | Final Score: ${score}`;
}


function renderWordBoxes() {
  container.innerHTML = "";

  wordObjects.forEach((wordObj, index) => {
    const span = document.createElement("span");

    let className = "word-box " + wordObj.status;
    if (index === currentWordIndex) className += " active";

    span.className = className;
    span.textContent = wordObj.text;

    container.appendChild(span);
  });
}

//buttons for selecting the difficulty 
document
  .querySelectorAll("#difficulty-popup button")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      startGame(btn.dataset.level);
    });
  });

//function for countdown  
input.addEventListener("keydown", e => {
  if (!gameStarted) return;

  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();

    if (!startTime) startTime = Date.now();

    const typed = input.value.trim();
    const currentWord = wordObjects[currentWordIndex];

    // last word handling
    if (currentWordIndex === wordObjects.length - 1) {
      currentWord.status = "correct";
      correctSound.play();
      totalTypedWords++;
      

      input.value = "";
      renderWordBoxes();

      // load next sentence (same difficulty)
      const list = levels[selectedLevel];
      currentSentence = list[Math.floor(Math.random() * list.length)];

      wordObjects = currentSentence.split(" ").map(word => ({
        text: word,
        status: "pending",
        score: word.length
      }));

      currentWordIndex = 0;
      renderWordBoxes();
      return;
    }

    if (!typed) return;

    // checking word and updating the score 
if (typed === currentWord.text) {//run if the word is  correct 
  currentWord.status = "correct";
  score += 1;
  totalTypedWords++;
  correctSound.play();
  scoreDisplay.textContent = score;
} else { 
  // wrong word
  currentWord.status = "wrong"; 
  mistakes += 1;
  wrongSound.play();
  mistakesDisplay.textContent = mistakes;

  if (mistakes >= 3) {
    stopGame("Game Over! Too many mistakes");
    gameover.play();
    return;
    
  }


    }

    currentWordIndex++;
    input.value = "";
    renderWordBoxes();
  }
});

//restarting the game 
const restartBtn = document.getElementById("restart-game");

restartBtn.addEventListener("click", () => {
  // stoping the current timer
  clearInterval(timerInterval);

  // Reset all game state
  gameStarted = false;
  score = 0;
  mistakes = 0;
  currentWordIndex = 0;
  totalTypedWords = 0;
  startTime = null;
  timeLeft = 60;

  // Reset displays
  scoreDisplay.textContent = score;
  mistakesDisplay.textContent = mistakes;
  timerDisplay.textContent = timeLeft;
  messageDisplay.textContent = "";

  // Show difficulty popup again
  document.getElementById("difficulty-popup").style.display = "flex";

  // Clear input
  input.value = "";

  // Clear word boxes
  container.innerHTML = "";
});
document.addEventListener("keydown", (e) => {
  const pressedKey = e.key.toLowerCase();
  
  // find overlay div with matching data-key
  const keyDiv = document.querySelector(`.key[data-key="${pressedKey}"]`);
  
  if (keyDiv) {
    keyDiv.classList.add("active");

    // remove glow after 200ms for click effect
    setTimeout(() => {
      keyDiv.classList.remove("active");
    }, 200);
  }
});

