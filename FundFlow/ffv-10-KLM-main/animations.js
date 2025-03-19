export class Animations {
    static async showGameExit(container, score) {
        const confetti = new window.JSConfetti();
        
        // Create quick game exit overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-exit-celebration';
        overlay.innerHTML = `
            <div class="exit-content">
                <h2 class="celebration-title">Game Over!</h2>
                <div class="score-display">
                    <span class="score-number">${score}</span>
                    <span class="score-label">points</span>
                </div>
                <div class="message">Returning to Arcade...</div>
            </div>
        `;
        
        container.appendChild(overlay);
        
        // Quick confetti burst
        await confetti.addConfetti({
            confettiColors: ['#ad49e1', '#4fc3f7', '#fff', '#c671ff'],
            confettiRadius: 6,
            confettiNumber: 50,
        });

        // Quick fade out
        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            }, 700);
        });
    }

    static showArcadeExit() {
        // Get total games played
        const coinRunnerGames = parseInt(localStorage.getItem('gamesPlayed_coinRunner')) || 0;
        const snakeGames = parseInt(localStorage.getItem('gamesPlayed_moneySnake')) || 0;
        const totalGamesPlayed = coinRunnerGames + snakeGames;

        // Get cumulative scores
        const coinRunnerScores = JSON.parse(localStorage.getItem('allScores_coinRunner')) || [];
        const snakeScores = JSON.parse(localStorage.getItem('allScores_moneySnake')) || [];
        
        // Calculate total score (sum of all scores from both games)
        const totalScore = [
            ...coinRunnerScores,
            ...snakeScores
        ].reduce((sum, score) => sum + score, 0);

        const overlay = document.createElement('div');
        overlay.className = 'arcade-exit-overlay';
        
        const content = document.createElement('div');
        content.className = 'exit-content';
        content.innerHTML = `
            <h2 class="celebration-title" style="color: #ad49e1;">Thanks for Playing!</h2>
            <div class="stats">
                <div class="stat-item">
                    <span id="games-played" style="color: #ad49e1;">${totalGamesPlayed}</span>
                    <label>Games Played</label>
                </div>
                <div class="stat-item">
                    <span id="high-score" style="color: #ad49e1;">${totalScore}</span>
                    <label>Total Score</label>
                </div>
            </div>
            <div class="rating-section">
                <p style="color: #ad49e1;">Rate Your Experience</p>
                <div class="star-rating">
                    ${Array(5).fill(0).map((_, i) => `
                        <i class="fas fa-star" data-rating="${i + 1}" style="--star-index: ${i}"></i>
                    `).join('')}
                </div>
                <div class="feedback-form">
                    <textarea 
                        placeholder="Share your thoughts with us..." 
                        maxlength="200"
                    ></textarea>
                    <button class="submit-feedback">Submit</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Handle star rating
        const stars = content.querySelectorAll('.fa-star');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('star-hover');
                    } else {
                        s.classList.remove('star-hover');
                    }
                });
            });

            star.addEventListener('mouseout', () => {
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= selectedRating) {
                        s.classList.add('star-selected');
                    } else {
                        s.classList.remove('star-selected', 'star-hover');
                    }
                });
            });

            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= selectedRating) {
                        s.classList.add('star-selected');
                    } else {
                        s.classList.remove('star-selected');
                    }
                });
            });
        });

        // Handle feedback submission
        const submitBtn = content.querySelector('.submit-feedback');
        submitBtn.addEventListener('click', () => {
            const feedback = content.querySelector('textarea').value;
            
            content.style.animation = 'fadeOut 0.3s ease forwards';
            
            setTimeout(() => {
                content.innerHTML = `
                    <div class="thank-you-content">
                        <h2 class="celebration-title" style="color: #ad49e1;">Thank You!</h2>
                        <p class="feedback-thanks" style="color: #ad49e1;">Your feedback helps us improve!</p>
                        <p class="redirect-msg" style="color: #ad49e1;">Redirecting to home...</p>
                    </div>
                `;
                content.style.animation = 'fadeIn 0.3s ease forwards';

                setTimeout(() => {
                    overlay.classList.add('fade-out');
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 500);
                }, 2000);
            }, 300);
        });
    }

    static addBalloons() {
        const container = document.querySelector('.arcade-exit-overlay');
        for (let i = 0; i < 10; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.left = `${Math.random() * 100}%`;
            balloon.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(balloon);
        }
    }

    static addConfetti() {
        const container = document.querySelector('.arcade-exit-overlay');
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(confetti);
        }
    }

    static async showAccessGranted() {
        const confetti = new window.JSConfetti();
        
        // Create celebration overlay
        const overlay = document.createElement('div');
        overlay.className = 'access-celebration';
        overlay.innerHTML = `
            <div class="celebration-content">
                <h2 class="celebration-title">🎮 Access Granted! 🎮</h2>
                <div class="celebration-message">Welcome to FundFlow Arcade!</div>
                <div class="loading-bar"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Multiple confetti bursts with emojis
        await confetti.addConfetti({
            emojis: ['🎮', '🕹️', '🎲', '💰', '⭐'],
            confettiNumber: 100,
        });
        
        // Redirect to arcade after celebration
        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                    window.location.href = 'arcade.html';
                }, 1000);
            }, 2000);
        });
    }

    static async showSecretAccess() {
        const confetti = new window.JSConfetti();
        
        // Create secret access overlay
        const overlay = document.createElement('div');
        overlay.className = 'secret-access-celebration';
        overlay.innerHTML = `
            <div class="celebration-content">
                <h2 class="celebration-title">🔓 Secret Code Accepted! 🔓</h2>
                <div class="celebration-message">Entering the Secret Arcade...</div>
                <div class="loading-bar"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Special confetti burst for secret access
        await confetti.addConfetti({
            confettiColors: ['#ad49e1', '#4fc3f7', '#fff', '#c671ff'],
            confettiRadius: 6,
            confettiNumber: 150,
            emojis: ['🎮', '🔑', '⭐', '💎'],
        });

        // Set secret access in localStorage and redirect
        localStorage.setItem('secretAccess', 'true');
        
        // Redirect to arcade after celebration
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                window.location.href = 'arcade.html';
            }, 1000);
        }, 2000);
    }
}

// Helper function for coin shower effect
function createCoinShower(container) {
    const coins = ['💰', '💎', '💵', '⭐'];
    for (let i = 0; i < 30; i++) {
        const coin = document.createElement('div');
        coin.className = 'falling-coin';
        coin.textContent = coins[Math.floor(Math.random() * coins.length)];
        coin.style.left = `${Math.random() * 100}%`;
        coin.style.animationDelay = `${Math.random() * 2}s`;
        coin.style.animationDuration = `${1 + Math.random() * 2}s`;
        container.appendChild(coin);
    }
} 