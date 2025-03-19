export class MoneySnake {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.gameOver = false;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gridSize = 20;
        this.speed = 150; // Initial speed in ms
        this.playTime = 0;
        this.timeInterval = null;
        
        // Sound effects
        this.sounds = {
            eat: new Audio('sounds/coin.wav'),
            hit: new Audio('sounds/hit.wav'),
            gameOver: new Audio('sounds/gameover.wav'),
            background: new Audio('sounds/background.wav')
        };
        
        // Set volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
        
        // Set background music volume lower
        this.sounds.background.volume = 0.1;
        this.sounds.background.loop = true;
        
        // Add keyboard handler binding
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="game-area snake-game">
                <div class="game-hud">
                    <div class="timer">Time: <span>00:00</span></div>
                    <div class="score">Score: <span>0</span></div>
                    <div class="esc-hint">Press ESC to exit</div>
                </div>
                <div class="game-grid"></div>
                <div class="spotify-player">
                    <iframe 
                        src="https://open.spotify.com/embed/track/6AI3ezQ4o3HUoP6Dhudph3?utm_source=generator&theme=0&autoplay=1&loop=1&play=1" 
                        width="100%" 
                        height="80" 
                        frameBorder="0" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                    </iframe>
                </div>
            </div>
        `;

        this.gameGrid = this.container.querySelector('.game-grid');
        this.setupGrid();
        this.initSnake();
        this.spawnFood();
        this.setupControls();
        this.startGame();
        this.startTimer();
    }

    setupGrid() {
        const minDimension = Math.min(window.innerWidth, window.innerHeight) - 100;
        const cellSize = Math.floor(minDimension / 20); // 20x20 grid
        this.gridSize = cellSize;
        this.cols = 20;
        this.rows = 20;
        
        this.gameGrid.style.width = `${cellSize * this.cols}px`;
        this.gameGrid.style.height = `${cellSize * this.rows}px`;
        this.gameGrid.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize}px)`;
        this.gameGrid.style.gridTemplateRows = `repeat(${this.rows}, ${cellSize}px)`;
    }

    initSnake() {
        const startX = Math.floor(this.cols / 4);
        const startY = Math.floor(this.rows / 2);
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.renderSnake();
    }

    spawnFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.cols);
            y = Math.floor(Math.random() * this.rows);
        } while (this.snake.some(segment => segment.x === x && segment.y === y));

        this.food = { x, y };
        this.renderFood();
    }

    setupControls() {
        // Remove old event listener if exists
        document.removeEventListener('keydown', this.handleKeyPress);
        // Add new event listener
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress(e) {
        if (this.gameOver) return;

        switch(e.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
            case 'Escape':
                // Handle ESC key
                this.cleanup();
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                break;
        }
    }

    startGame() {
        this.sounds.background.play().catch(e => console.log('Background music failed to start'));
        
        this.gameLoop = setInterval(() => {
            this.update();
        }, this.speed);
    }

    update() {
        if (this.gameOver) return;

        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        // Update head position based on direction
        switch(this.direction) {
            case 'up': head.y = (head.y - 1 + this.rows) % this.rows; break;
            case 'down': head.y = (head.y + 1) % this.rows; break;
            case 'left': head.x = (head.x - 1 + this.cols) % this.cols; break;
            case 'right': head.x = (head.x + 1) % this.cols; break;
        }

        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.sounds.eat.currentTime = 0;
            this.sounds.eat.play().catch(e => console.log('Sound play failed'));
            this.spawnFood();
            this.increaseSpeed();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }

        this.renderSnake();
    }

    renderSnake() {
        this.gameGrid.innerHTML = '';
        
        // Render snake
        this.snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.className = `snake-segment ${index === 0 ? 'snake-head' : ''}`;
            snakeElement.style.gridColumn = segment.x + 1;
            snakeElement.style.gridRow = segment.y + 1;
            
            // Add direction indicator for head
            if (index === 0) {
                snakeElement.classList.add(`direction-${this.direction}`);
            }
            
            this.gameGrid.appendChild(snakeElement);
        });

        // Render food with animation
        if (this.food) {
            const foodElement = document.createElement('div');
            foodElement.className = 'snake-food';
            foodElement.style.gridColumn = this.food.x + 1;
            foodElement.style.gridRow = this.food.y + 1;
            this.gameGrid.appendChild(foodElement);
        }
    }

    increaseSpeed() {
        if (this.speed > 50) {
            this.speed = Math.max(50, this.speed - 3); // Slightly faster speed increase
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    updateScore() {
        const scoreElement = this.container.querySelector('.score span');
        if (scoreElement) {
            // Add bonus points for longer snake
            const lengthBonus = Math.floor((this.snake.length - 3) / 5) * 5;
            this.score += 10 + lengthBonus;
            scoreElement.textContent = this.score;
        }

        const highScore = parseInt(localStorage.getItem('highScore_moneySnake')) || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore_moneySnake', this.score);
        }
    }

    startTimer() {
        this.timeInterval = setInterval(() => {
            this.playTime++;
            const minutes = Math.floor(this.playTime / 60);
            const seconds = this.playTime % 60;
            const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.container.querySelector('.timer span').textContent = timeDisplay;
        }, 1000);
    }

    renderFood() {
        if (!this.food) return;
        
        const foodElement = document.createElement('div');
        foodElement.className = 'snake-food';
        foodElement.style.gridColumn = this.food.x + 1;
        foodElement.style.gridRow = this.food.y + 1;
        this.gameGrid.appendChild(foodElement);
    }

    cleanup() {
        clearInterval(this.gameLoop);
        clearInterval(this.timeInterval);
        
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // Clear the game area
        this.container.innerHTML = '';
    }

    // Add this method to properly end the game
    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.timeInterval);
        
        this.sounds.hit.play().catch(e => console.log('Sound play failed'));
        setTimeout(() => {
            this.sounds.gameOver.play().catch(e => console.log('Sound play failed'));
        }, 500);

        const finalTime = this.container.querySelector('.timer span').textContent;
        
        // Update games played count
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed_moneySnake')) || 0;
        localStorage.setItem('gamesPlayed_moneySnake', gamesPlayed + 1);

        // Store this game's score in array of all scores
        const allScores = JSON.parse(localStorage.getItem('allScores_moneySnake')) || [];
        allScores.push(this.score);
        localStorage.setItem('allScores_moneySnake', JSON.stringify(allScores));
        
        // Show game over screen
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over</h2>
                <div class="stats">
                    <div class="stat">Score: ${this.score}</div>
                    <div class="stat">Time: ${finalTime}</div>
                    <div class="stat">Games Played: ${gamesPlayed + 1}</div>
                </div>
                <div class="roast">Your snake's as long as your savings streak!</div>
                <button class="retry-btn">Try Again</button>
            </div>
        `;
        
        this.container.appendChild(gameOver);

        gameOver.querySelector('.retry-btn').addEventListener('click', () => {
            this.container.innerHTML = '';
            this.playTime = 0;
            this.score = 0;
            this.speed = 150;
            this.direction = 'right';
            this.nextDirection = 'right';
            this.init();
            this.gameOver = false;
        });
    }
} 