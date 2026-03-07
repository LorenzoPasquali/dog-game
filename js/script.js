// ============================================
// TOMIMIS GAME - Game Logic
// ============================================

const miet = document.getElementById('miet');
const pipe = document.getElementById('pipe');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const finalScoreDisplay = document.getElementById('finalScore');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const btnRestart = document.getElementById('btnRestart');
const gameBoard = document.getElementById('gameBoard');

// Game state
let score = 0;
let bestScore = parseInt(localStorage.getItem('tomimis-best') || '0', 10);
let gameLoop = null;
let isJumping = false;
let gameRunning = false;
let gameStarted = false;
let pipeSpeed = 1.6;
let speedLevel = 0;

// Initialize
bestScoreDisplay.textContent = formatScore(bestScore);

// ---- SCORE ----
function formatScore(n) {
    return String(n).padStart(4, '0');
}

function updateScore() {
    score++;

    // Increase speed every 50 points
    const newSpeedLevel = Math.floor(score / 50);
    if (newSpeedLevel > speedLevel) {
        speedLevel = newSpeedLevel;
        pipeSpeed = Math.max(0.7, 1.6 - speedLevel * 0.12);
        pipe.style.setProperty('--pipe-speed', pipeSpeed + 's');
        // Flash effect on speed increase
        gameBoard.classList.add('speed-flash');
        setTimeout(() => gameBoard.classList.remove('speed-flash'), 400);
    }

    scoreDisplay.textContent = formatScore(score);
}

// ---- JUMP ----
function jump() {
    if (!gameStarted) {
        startGame();
        return;
    }
    if (!gameRunning || isJumping) return;

    isJumping = true;
    miet.classList.remove('idle');
    miet.classList.add('jumping');

    setTimeout(() => {
        miet.classList.remove('jumping');
        isJumping = false;
        if (gameRunning) {
            miet.classList.add('idle');
        }
    }, 550);
}

// ---- COLLISION DETECTION ----
function checkCollision() {
    const pipeRect = pipe.getBoundingClientRect();
    const mietRect = miet.getBoundingClientRect();

    // Shrink hitboxes for fair collision
    const margin = 18;
    const mietBox = {
        left: mietRect.left + margin,
        right: mietRect.right - margin,
        top: mietRect.top + margin,
        bottom: mietRect.bottom - 5
    };
    const pipeBox = {
        left: pipeRect.left + 10,
        right: pipeRect.right - 10,
        top: pipeRect.top + 10,
        bottom: pipeRect.bottom
    };

    return (
        mietBox.right > pipeBox.left &&
        mietBox.left < pipeBox.right &&
        mietBox.bottom > pipeBox.top &&
        mietBox.top < pipeBox.bottom
    );
}

// ---- SCORE TRACKING (pipe passed) ----
let pipePassedMiet = false;

function checkPipePassed() {
    const pipeRect = pipe.getBoundingClientRect();
    const mietRect = miet.getBoundingClientRect();

    if (pipeRect.right < mietRect.left) {
        if (!pipePassedMiet) {
            pipePassedMiet = true;
            updateScore();
        }
    } else {
        pipePassedMiet = false;
    }
}

// ---- GAME LOOP ----
function gameLoopFn() {
    if (!gameRunning) return;

    if (checkCollision()) {
        gameOver();
        return;
    }

    checkPipePassed();
}

// ---- START GAME ----
function startGame() {
    gameStarted = true;
    gameRunning = true;
    score = 0;
    speedLevel = 0;
    pipeSpeed = 1.6;

    scoreDisplay.textContent = formatScore(0);
    pipe.style.setProperty('--pipe-speed', pipeSpeed + 's');

    // Hide overlays
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Reset player
    miet.src = './images/miet.gif';
    miet.style.width = '';
    miet.style.bottom = '';
    miet.style.marginLeft = '';
    miet.classList.remove('jumping');
    miet.classList.add('idle');
    isJumping = false;

    // Start obstacle
    pipe.classList.remove('stopped');
    pipe.classList.add('moving');
    pipe.style.right = '';

    // Start game loop
    gameLoop = setInterval(gameLoopFn, 16);
}

// ---- GAME OVER ----
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    // Screen shake
    gameBoard.classList.add('shake');
    setTimeout(() => gameBoard.classList.remove('shake'), 400);

    // Stop pipe where it is
    const pipeRect = pipe.getBoundingClientRect();
    const boardRect = gameBoard.getBoundingClientRect();
    pipe.classList.remove('moving');
    pipe.classList.add('stopped');
    pipe.style.right = (boardRect.right - pipeRect.right) + 'px';

    // Stop player
    const mietBottom = window.getComputedStyle(miet).bottom;
    miet.classList.remove('jumping', 'idle');
    miet.style.bottom = mietBottom;
    miet.src = './images/gameover.png';
    miet.style.width = '180px';
    miet.style.marginLeft = '-30px';

    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('tomimis-best', String(bestScore));
        bestScoreDisplay.textContent = formatScore(bestScore);
    }

    // Show game over overlay after a short delay
    finalScoreDisplay.textContent = score;
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 600);
}

// ---- RESTART ----
function restartGame() {
    gameBoard.classList.remove('shake');
    startGame();
}

// ---- EVENT LISTENERS ----
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});

gameBoard.addEventListener('click', jump);

btnRestart.addEventListener('click', (e) => {
    e.stopPropagation();
    restartGame();
});

// Idle animation on start screen
miet.classList.add('idle');
