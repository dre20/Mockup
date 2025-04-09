import { getSceneObjects } from './sceneSetup.js';

// Game state variables
let questionsAnswered = 0;
const totalQuestions = 7;
let gameOverTimeout;
let isPaused = false;

// Track correct answers for good habits
const goodHabitsCorrect = {
  1: false, // Drink water
  2: false, // Exercise daily
  3: false, // Eat vegetables
  4: false  // Get enough sleep
};

// Track if all good habits were answered correctly (YES)
let allGoodHabitsCorrect = false;

// Cube selection logic for all questions
export function setupQuestion(questionNumber, isPositive) {
  const questionContainer = document.getElementById(`question-${questionNumber}`);
  const yesCube = document.getElementById(`yes-cube-${questionNumber}`);
  const noCube = document.getElementById(`no-cube-${questionNumber}`);
  
  function selectCube(selectedCube, isYes) {
    // If already selected, do nothing
    if (selectedCube.classList.contains('selected')) return;
    
    // Mark both cubes as disabled
    yesCube.classList.add('disabled');
    noCube.classList.add('disabled');
    
    // Set new selection
    selectedCube.classList.add('selected');
    
    // Mark question as answered for tooltip functionality
    questionContainer.classList.add('answered');
    
    // Check if the selection was correct: 
    // For positive questions (good habits): YES is correct
    // For negative questions (bad habits): NO is correct
    const correctChoice = isPositive ? isYes : !isYes;
    
    if (correctChoice) {
      selectedCube.style.backgroundColor = '#4CAF50'; // Green for correct
      
      // If this is a good habit and correctly answered YES, mark it
      if (isPositive && isYes) {
        goodHabitsCorrect[questionNumber] = true;
      }
    } else {
      selectedCube.style.backgroundColor = '#F44336'; // Red for incorrect
    }
    
    // Count this as an answered question
    questionsAnswered++;
    
    // Get animations from scene
    const { suzanneAction, armatureAction } = getSceneObjects();
    
    // Handle question 3 (stop Suzanne spinning)
    if (questionNumber === 3 && suzanneAction) {
      suzanneAction.paused = true;
    }
    
    // Handle question 7 (resume Suzanne and pause armature)
    if (questionNumber === 7) {
      if (suzanneAction) suzanneAction.paused = false;
      if (armatureAction) armatureAction.paused = true;
    }
    
    // If all questions are answered, check if we should show the special text
    if (questionsAnswered === totalQuestions) {
      setTimeout(() => {
        // Check if all good habits were answered correctly with YES
        allGoodHabitsCorrect = goodHabitsCorrect[1] && 
                              goodHabitsCorrect[2] && 
                              goodHabitsCorrect[3] && 
                              goodHabitsCorrect[4];
        
        // Only show special text if all good habits were correctly answered
        if (allGoodHabitsCorrect) {
          // Hide all questions
          document.querySelectorAll('.question-container').forEach(q => {
            q.style.display = 'none';
          });
          // Show the special text
          document.getElementById('special-text').style.display = 'block';
        }
      }, 500);
    }
  }

  yesCube.addEventListener('click', () => selectCube(yesCube, true));
  noCube.addEventListener('click', () => selectCube(noCube, false));
}

// Setup all questions
export function setupAllQuestions() {
  // Positive questions (good behavior should be YES)
  setupQuestion(1, true); // Drink water
  setupQuestion(2, true); // Exercise daily
  setupQuestion(3, true); // Eat vegetables
  setupQuestion(4, true); // Get enough sleep
  
  // Negative questions (bad behavior should be NO)
  setupQuestion(5, false); // Smoke cigarettes
  setupQuestion(6, false); // Eat junk food
  setupQuestion(7, false); // Bully others
}

// Handle game over
export function showGameOver() {
  document.getElementById('game-over-overlay').style.display = 'flex';
}

// Set up the game over timer (60 seconds = 1 minute)
export function startGameTimer() {
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
  }
  
  gameOverTimeout = setTimeout(() => {
    if (!isPaused) {
      // Freeze the website and show game over overlay
      showGameOver();
    }
  }, 60000); // 60000 ms = 1 minute
  
  return gameOverTimeout;
}

// Pause/unpause game
export function togglePause() {
  isPaused = !isPaused;
  
  if (isPaused) {
    // Clear the game over timeout
    clearTimeout(gameOverTimeout);
    return true;
  } else {
    // Restart the game timer
    startGameTimer();
    return false;
  }
}

// Get game state
export function getGameState() {
  return {
    questionsAnswered,
    totalQuestions,
    goodHabitsCorrect,
    allGoodHabitsCorrect,
    isPaused
  };
}