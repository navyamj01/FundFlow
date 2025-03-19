export class CoinRunner {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.gameOver = false;
        this.player = null;
        this.coins = [];
        this.obstacles = [];
        this.musicPlayer = null;
        
        this.playerState = {
            x: 0,
            speed: 8,
            isMovingLeft: false,
            isMovingRight: false,
            isJumping: false
        };
        
        this.playTime = 0;
        this.timeInterval = null;
        
        // Sound effects
        this.sounds = {
            jump: new Audio('sounds/jump.wav'),
            coin: new Audio('sounds/coin.wav'),
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
        
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="game-area">
                <div class="game-hud">
                    <div class="timer">Time: <span>00:00</span></div>
                    <div class="score">Score: <span>0</span></div>
                    <div class="esc-hint">Press ESC to exit</div>
                </div>
                <div class="player"></div>
                <div class="spotify-player">
                    <iframe 
                        src="https://open.spotify.com/embed/track/5sdQOyqq2IDhvmx2lHOpwd?utm_source=generator&theme=0&autoplay=1&loop=1&play=1" 
                        width="100%" 
                        height="80" 
                        frameBorder="0" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                    </iframe>
                </div>
            </div>
        `;

        this.player = document.querySelector('.player');
        this.playerState.x = this.container.clientWidth / 2;
        this.player.style.left = `${this.playerState.x}px`;
        
        this.setupControls();
        this.startGame();
        this.startTimer();
    }

    setupControls() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.addEventListener('keyup', this.handleKeyRelease.bind(this));
    }

    handleKeyPress(e) {
        if (this.gameOver) return;

        switch(e.key) {
            case 'ArrowLeft':
                this.playerState.isMovingLeft = true;
                break;
            case 'ArrowRight':
                this.playerState.isMovingRight = true;
                break;
            case 'ArrowUp':
            case ' ':
                if (!this.playerState.isJumping) {
                    this.playerState.isJumping = true;
                    this.player.classList.add('jumping');
                    // Play jump sound
                    this.sounds.jump.currentTime = 0;
                    this.sounds.jump.play().catch(e => console.log('Jump sound failed'));
                    setTimeout(() => {
                        this.player.classList.remove('jumping');
                        this.playerState.isJumping = false;
                    }, 500);
                }
                break;
        }
    }

    handleKeyRelease(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.playerState.isMovingLeft = false;
                break;
            case 'ArrowRight':
                this.playerState.isMovingRight = false;
                break;
        }
    }

    startGame() {
        // Start background music
        this.sounds.background.play().catch(e => console.log('Background music failed to start'));
        
        this.gameLoop = setInterval(() => {
            this.updateGame();
            this.checkCollisions();
            this.updateScore();
        }, 1000/60);

        this.coinSpawner = setInterval(() => this.spawnCoin(), 1000);
        this.obstacleSpawner = setInterval(() => this.spawnObstacle(), 2000);
    }

    updateGame() {
        // Update player position
        if (this.playerState.isMovingLeft) {
            this.playerState.x = Math.max(0, this.playerState.x - this.playerState.speed);
        }
        if (this.playerState.isMovingRight) {
            this.playerState.x = Math.min(
                this.container.clientWidth - 50,
                this.playerState.x + this.playerState.speed
            );
        }
        
        // Apply movement
        this.player.style.left = `${this.playerState.x}px`;

        // Update coins and obstacles
        this.coins.forEach(coin => {
            let top = parseInt(getComputedStyle(coin).top);
            coin.style.top = (top + 2) + 'px';
            if (top > this.container.clientHeight) {
                coin.remove();
                this.coins = this.coins.filter(c => c !== coin);
            }
        });

        this.obstacles.forEach(obstacle => {
            let top = parseInt(getComputedStyle(obstacle).top);
            obstacle.style.top = (top + 3) + 'px';
            if (top > this.container.clientHeight) {
                obstacle.remove();
                this.obstacles = this.obstacles.filter(o => o !== obstacle);
            }
        });
    }

    spawnCoin() {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.style.left = Math.random() * (this.container.clientWidth - 30) + 'px';
        coin.style.top = '-30px';
        this.container.appendChild(coin);
        this.coins.push(coin);
    }

    spawnObstacle() {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = Math.random() * (this.container.clientWidth - 40) + 'px';
        obstacle.style.top = '-40px';
        this.container.appendChild(obstacle);
        this.obstacles.push(obstacle);
    }

    checkCollisions() {
        const playerRect = this.player.getBoundingClientRect();

        // Check coin collisions
        this.coins.forEach(coin => {
            const coinRect = coin.getBoundingClientRect();
            if (this.isColliding(playerRect, coinRect)) {
                this.score += 10;
                // Play coin sound
                this.sounds.coin.currentTime = 0;
                this.sounds.coin.play().catch(e => console.log('Sound play failed'));
                coin.remove();
                this.coins = this.coins.filter(c => c !== coin);
                this.showScorePopup('+10', coinRect);
            }
        });

        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (this.isColliding(playerRect, obstacleRect)) {
                // Play hit and game over sounds
                this.sounds.hit.play().catch(e => console.log('Sound play failed'));
                setTimeout(() => {
                    this.sounds.gameOver.play().catch(e => console.log('Sound play failed'));
                }, 500);
                this.endGame();
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    showScorePopup(text, position) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = text;
        popup.style.left = position.left + 'px';
        popup.style.top = position.top + 'px';
        this.container.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    updateScore() {
        // Update the score in the game HUD
        const scoreElement = this.container.querySelector('.score span');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }

        // Update high score
        const highScore = parseInt(localStorage.getItem('highScore_coinRunner')) || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore_coinRunner', this.score);
        }
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.coinSpawner);
        clearInterval(this.obstacleSpawner);
        clearInterval(this.timeInterval);
        
        const finalTime = this.container.querySelector('.timer span').textContent;
        const avgCoinsPerMinute = (this.score / 10) / (this.playTime / 60);
        
        // Update games played count
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed_coinRunner')) || 0;
        localStorage.setItem('gamesPlayed_coinRunner', gamesPlayed + 1);

        // Store this game's score in array of all scores
        const allScores = JSON.parse(localStorage.getItem('allScores_coinRunner')) || [];
        allScores.push(this.score);
        localStorage.setItem('allScores_coinRunner', JSON.stringify(allScores));
        
        // Select appropriate roast based on performance
        let roast;
        if (this.playTime < 10) {
            roast = "Gone faster than your paycheck!";
        } else if (avgCoinsPerMinute < 2) {
            roast = "Playing it safe, just like your investment strategy?";
        } else if (this.score < 100) {
            roast = "Even your savings account has better numbers than this...";
        } else if (this.score < 300) {
            roast = "Almost as good as your expense management... almost.";
        } else {
            roast = "Finally! Something higher than your expenses!";
        }
        
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
                <div class="roast">${roast}</div>
                <button class="retry-btn">Try Again</button>
            </div>
        `;
        
        this.container.appendChild(gameOver);

        gameOver.querySelector('.retry-btn').addEventListener('click', () => {
            this.container.innerHTML = '';
            this.playTime = 0;
            this.init();
            this.gameOver = false;
            this.score = 0;
        });
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

    cleanup() {
        clearInterval(this.gameLoop);
        clearInterval(this.coinSpawner);
        clearInterval(this.obstacleSpawner);
        clearInterval(this.timeInterval);
        
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('keyup', this.handleKeyRelease);
    }
} 