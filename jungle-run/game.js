const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const gameOverDiv = document.getElementById('gameOver');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const finalScoreDisplay = document.getElementById('finalScore');

canvas.width = 800;
canvas.height = 400;

let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('monkoHighScore') || 0;
highScoreDisplay.textContent = highScore;

// Game objects
const monko = {
    x: 50,
    y: 300,
    width: 40,
    height: 40,
    velocityY: 0,
    jumping: false,
    gravity: 0.6,
    jumpPower: -12
};

let obstacles = [];
let bananas = [];
let gameSpeed = 3;
let frameCount = 0;

// Event listeners
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        jump();
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning) jump();
});

function startGame() {
    startBtn.style.display = 'none';
    gameRunning = true;
    score = 0;
    gameSpeed = 3;
    obstacles = [];
    bananas = [];
    monko.y = 300;
    monko.velocityY = 0;
    gameLoop();
}

function restartGame() {
    gameOverDiv.classList.add('hidden');
    startGame();
}

function jump() {
    if (!monko.jumping) {
        monko.velocityY = monko.jumpPower;
        monko.jumping = true;
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update
    frameCount++;
    
    // Monko physics
    monko.velocityY += monko.gravity;
    monko.y += monko.velocityY;
    
    // Ground collision
    if (monko.y >= 300) {
        monko.y = 300;
        monko.velocityY = 0;
        monko.jumping = false;
    }
    
    // Spawn obstacles
    if (frameCount % 120 === 0) {
        obstacles.push({
            x: canvas.width,
            y: 310,
            width: 30,
            height: 40
        });
    }
    
    // Spawn bananas
    if (frameCount % 90 === 0) {
        const yPos = Math.random() > 0.5 ? 200 : 280;
        bananas.push({
            x: canvas.width,
            y: yPos,
            width: 20,
            height: 20
        });
    }
    
    // Move obstacles
    obstacles = obstacles.filter(obs => {
        obs.x -= gameSpeed;
        return obs.x > -obs.width;
    });
    
    // Move bananas
    bananas = bananas.filter(banana => {
        banana.x -= gameSpeed;
        
        // Check collision with monko
        if (checkCollision(monko, banana)) {
            score++;
            scoreDisplay.textContent = score;
            return false; // Remove banana
        }
        
        return banana.x > -banana.width;
    });
    
    // Check obstacle collisions
    for (let obs of obstacles) {
        if (checkCollision(monko, obs)) {
            endGame();
            return;
        }
    }
    
    // Increase difficulty
    if (frameCount % 300 === 0) {
        gameSpeed += 0.3;
    }
    
    // Draw
    drawMonko();
    drawObstacles();
    drawBananas();
    
    requestAnimationFrame(gameLoop);
}

function drawMonko() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(monko.x, monko.y, monko.width, monko.height);
    
    // Simple monko face
    ctx.fillStyle = '#000';
    ctx.fillRect(monko.x + 10, monko.y + 10, 5, 5); // Eye
    ctx.fillRect(monko.x + 25, monko.y + 10, 5, 5); // Eye
    ctx.fillRect(monko.x + 15, monko.y + 25, 10, 3); // Mouth
}

function drawObstacles() {
    ctx.fillStyle = '#654321';
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Tree trunk detail
        ctx.strokeStyle = '#4a3319';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function drawBananas() {
    bananas.forEach(banana => {
        // Draw banana emoji-style
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(banana.x + 10, banana.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Banana text
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText('🍌', banana.x, banana.y + 15);
    });
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function endGame() {
    gameRunning = false;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('monkoHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    finalScoreDisplay.textContent = score;
    gameOverDiv.classList.remove('hidden');
}
