import { MoneySnake } from './moneySnake.js';
import { CoinRunner } from './coinRunner.js';
import { Animations } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check for secret access
    if (!localStorage.getItem('secretAccess')) {
        window.location.href = 'home.html';
        return;
    }

    const SECRET_CODE = "FUNDFLOWKLM";
    
    const gameCards = document.querySelectorAll('.game-card');
    const fullscreenGame = document.getElementById('fullscreen-game');
    const gameContainer = document.getElementById('game-container');
    let currentGame = null;
    let currentGameInstance = null;

    // Game Card Click Handlers
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const game = card.dataset.game;
            startGame(game);
        });
    });

    // Global ESC key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentGameInstance && !currentGameInstance.gameOver) {
            e.preventDefault();
            returnToArcade();
        }
    });

    function startGame(gameName) {
        currentGame = gameName;
        fullscreenGame.classList.add('active');
        gameContainer.innerHTML = '';
        
        // Reset scores
        document.getElementById('current-score').textContent = '0';
        document.getElementById('high-score').textContent = localStorage.getItem(`highScore_${gameName}`) || '0';

        // Create new game instance
        switch(gameName) {
            case 'coinRunner':
                currentGameInstance = new CoinRunner(gameContainer);
                break;
            case 'moneySnake':
                currentGameInstance = new MoneySnake(gameContainer);
                break;
        }
    }

    // Function to return to arcade view
    function returnToArcade() {
        if (!currentGameInstance) return;

        const score = document.getElementById('current-score').textContent;
        
        // First cleanup the current game
        currentGameInstance.cleanup();
        currentGameInstance = null;

        // Hide the game screen immediately
        fullscreenGame.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
            fullscreenGame.classList.remove('active');
            fullscreenGame.style.animation = '';
            gameContainer.innerHTML = '';
            
            // Reset game state
            currentGame = null;

            // Show quick return message
            const returnMessage = document.createElement('div');
            returnMessage.className = 'quick-return-message';
            returnMessage.innerHTML = `
                <div class="message">
                    <h3>Back to Arcade</h3>
                    <p>Score: ${score}</p>
                </div>
            `;
            document.body.appendChild(returnMessage);

            // Remove message after animation - shorter duration
            setTimeout(() => {
                returnMessage.remove();
            }, 500);
        }, 200);
    }

    // Exit arcade button (separate from game exit)
    document.querySelector('.exit-btn').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentGameInstance) {
            currentGameInstance.cleanup();
        }
        Animations.showArcadeExit();
    });
}); 