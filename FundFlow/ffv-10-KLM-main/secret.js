document.addEventListener('DOMContentLoaded', () => {
    const SECRET_CODE = "FUNDFLOWKLM";
    const secretTrigger = document.querySelector('.secret-trigger');
    const secretModal = document.getElementById('secret-modal');
    const secretInput = document.getElementById('secret-code');
    let clickCount = 0;

    // Show modal when clicking on "Fund" three times
    secretTrigger.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 3) {
            secretModal.classList.add('active');
            secretInput.value = ''; // Clear any previous input
            secretInput.focus();
            clickCount = 0; // Reset counter
        }
    });

    // Hide modal when clicking outside
    secretModal.addEventListener('click', (e) => {
        if (e.target === secretModal) {
            secretModal.classList.remove('active');
        }
    });

    // Handle secret code input
    secretInput.addEventListener('input', (e) => {
        const input = e.target.value.toUpperCase();
        
        if (input === SECRET_CODE) {
            localStorage.setItem('secretAccess', 'true');
            
            secretModal.innerHTML = `
                <div class="secret-content">
                    <h3>🎮 Access Granted! 🎮</h3>
                    <div class="modal-inner">
                        <p>Welcome to the arcade!</p>
                        <div class="loader"></div>
                    </div>
                </div>
            `;

            // Shorter redirect delay
            setTimeout(() => {
                window.location.href = 'arcade.html';
            }, 800); // Reduced from 1500ms to 800ms
        }
    });
}); 