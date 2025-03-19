function showGoalForm() {
    const modal = document.getElementById('goalFormModal');
    if (modal) {
        // Add icons to form fields
        const formGroups = modal.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('input, select, textarea');
            if (input) {
                const icon = document.createElement('i');
                switch(input.id) {
                    case 'goal-title':
                        icon.className = 'fas fa-bullseye';
                        break;
                    case 'goal-amount':
                        icon.className = 'fas fa-money-bill-wave';
                        break;
                    case 'goal-deadline':
                        icon.className = 'fas fa-calendar-alt';
                        break;
                    case 'goal-category':
                        icon.className = 'fas fa-tag';
                        break;
                    case 'goal-priority':
                        icon.className = 'fas fa-flag';
                        break;
                    case 'goal-description':
                        icon.className = 'fas fa-comment-alt';
                        break;
                    case 'current-amount':
                        icon.className = 'fas fa-piggy-bank';
                        break;
                    case 'goal-image':
                        icon.className = 'fas fa-image';
                        break;
                }
                group.appendChild(icon);
            }
        });

        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const goalForm = document.getElementById('goal-form');
    const activeGoals = document.getElementById('active-goals');
    const achievedGoals = document.getElementById('achieved-goals');
    let goals = JSON.parse(localStorage.getItem('goals')) || [];

    // Render a single goal
    function renderGoal(goal) {
        const progress = (goal.currentAmount / goal.amount) * 100;
        const daysLeft = calculateDaysLeft(goal.deadline);
        
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-card';
        goalElement.dataset.id = goal.id;
        
        goalElement.innerHTML = `
            <div class="goal-header">
                <h3>${goal.title}</h3>
                <span class="goal-priority priority-${goal.priority}">${goal.priority}</span>
                ${goal.status === 'achieved' ? '<span class="achieved-tag">Completed</span>' : ''}
            </div>
            ${goal.image ? `<img src="${goal.image}" alt="${goal.title}" class="goal-image">` : ''}
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <p>${progress.toFixed(1)}% Complete</p>
            </div>
            <div class="goal-details">
                <p>Target: ₹${goal.amount}</p>
                <p>Current: ₹${goal.currentAmount}</p>
                <div class="goal-deadline">
                    <i class="fas fa-clock"></i>
                    <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</span>
                </div>
                <span class="goal-category">${goal.category}</span>
            </div>
        `;

        // Add delete button
        const goalHeader = goalElement.querySelector('.goal-header');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'goal-delete';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            showDeleteConfirmation(goal);
        };
        goalHeader.appendChild(deleteButton);

        // Add hover details
        const hoverDetails = document.createElement('div');
        hoverDetails.className = 'goal-hover-details';
        hoverDetails.innerHTML = `
            <p class="hover-description">${goal.description}</p>
            <div class="hover-stats">
                <span><i class="fas fa-calendar"></i> Due: ${new Date(goal.deadline).toLocaleDateString()}</span>
                <span><i class="fas fa-chart-line"></i> Progress: ${progress.toFixed(1)}%</span>
            </div>
        `;
        goalElement.appendChild(hoverDetails);

        // Add click handler for preview
        goalElement.onclick = (e) => {
            if (!e.target.closest('.goal-delete')) {
                showGoalPreview(goal);
            }
        };

        // Add to appropriate container
        const container = goal.status === 'achieved' ? achievedGoals : activeGoals;
        container.appendChild(goalElement);
    }

    // Function to move goal to achieved
    function moveToAchieved(goal) {
        goal.status = 'achieved';
        saveGoals();
        // Re-render all goals
        activeGoals.innerHTML = '';
        achievedGoals.innerHTML = '';
        goals.forEach(renderGoal);
        updateStatistics();
        showNotification('Goal achieved! 🎉', 'success');
    }

    // Calculate days left
    function calculateDaysLeft(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Update goals status - simplified version without drag and drop
    function updateGoalsStatus() {
        goals.forEach(goal => {
            if (goal.currentAmount >= goal.amount && goal.status !== 'achieved') {
                goal.status = 'achieved';
                moveToAchieved(goal);
            }
        });
        saveGoals();
        updateStatistics();
    }

    // Modal handling
    const modal = document.getElementById('goalFormModal');
    const closeBtn = document.querySelector('.close-modal');

    // Function to close modal
    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            if (goalForm) {
                goalForm.reset();
            }
        }
    }

    // Close modal when clicking the close button (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle form submission
    if (goalForm) {
        goalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Handle image file
            const imageFile = document.getElementById('goal-image').files[0];
            let imageUrl = '';
            
            if (imageFile) {
                // Convert image to base64
                const reader = new FileReader();
                imageUrl = await new Promise(resolve => {
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(imageFile);
                });
            }
            
            const goal = {
                id: Date.now(),
                title: document.getElementById('goal-title').value,
                amount: parseFloat(document.getElementById('goal-amount').value),
                deadline: document.getElementById('goal-deadline').value,
                category: document.getElementById('goal-category').value,
                priority: document.getElementById('goal-priority').value,
                description: document.getElementById('goal-description').value,
                currentAmount: parseFloat(document.getElementById('current-amount').value),
                image: imageUrl,
                status: 'active',
                createdAt: new Date().toISOString(),
                moneyHistory: [], // Array to store money addition history
            };

            goals.push(goal);
            saveGoals();
            
            // Clear containers and re-render all goals
            activeGoals.innerHTML = '';
            achievedGoals.innerHTML = '';
            goals.forEach(renderGoal);
            
            updateStatistics();
            
            // Close modal and reset form
            closeModal();
            
            // Show success notification
            showNotification('Goal created successfully!', 'success');
        });
    }

    // Add missing functions
    function saveGoals() {
        localStorage.setItem('goals', JSON.stringify(goals));
    }

    function updateStatistics() {
        const totalGoals = goals.length;
        const achievedCount = goals.filter(goal => goal.status === 'achieved').length;
        const successRate = totalGoals ? ((achievedCount / totalGoals) * 100).toFixed(1) : 0;

        document.getElementById('total-goals').textContent = totalGoals;
        document.getElementById('achieved-count').textContent = achievedCount;
        document.getElementById('success-rate').textContent = `${successRate}%`;
    }

    function showNotification(message, type) {
        // Implementation of notification display
        console.log(message); // Fallback if notification isn't implemented
    }

    // Initial render of goals and statistics
    goals.forEach(renderGoal);
    updateStatistics();

    // Add these functions for delete confirmation
    function showDeleteConfirmation(goal) {
        const deleteModal = document.createElement('div');
        deleteModal.className = 'modal delete-confirmation-modal';
        deleteModal.innerHTML = `
            <div class="modal-content">
                <i class="fas fa-exclamation-triangle warning-icon"></i>
                <h2>Delete Goal</h2>
                <p>Are you sure you want to delete</p>
                <p class="goal-title">"${goal.title}"?</p>
                <p>This action cannot be undone.</p>
                
                <div class="password-section">
                    <label class="password-label" for="deletePassword">
                        Please enter your password to confirm:
                    </label>
                    <input 
                        type="password" 
                        id="deletePassword" 
                        class="password-input" 
                        placeholder="Enter your password"
                    >
                    <div class="password-error">Incorrect password. Please try again.</div>
                </div>

                <div class="modal-buttons">
                    <button class="delete-cancel">Cancel</button>
                    <button class="delete-confirm">Delete Goal</button>
                </div>
            </div>
        `;

        document.body.appendChild(deleteModal);
        deleteModal.style.display = 'flex';

        const passwordInput = deleteModal.querySelector('#deletePassword');
        const passwordError = deleteModal.querySelector('.password-error');

        // Handle close and cancel
        const closeModal = () => {
            deleteModal.classList.add('fade-out');
            setTimeout(() => deleteModal.remove(), 300);
        };

        deleteModal.querySelector('.delete-cancel').onclick = closeModal;

        // Handle delete confirmation
        deleteModal.querySelector('.delete-confirm').onclick = async () => {
            const password = passwordInput.value;
            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users'));

            if (!storedUser || !users) {
                showNotification('Please log in to delete goals', 'error');
                closeModal();
                return;
            }

            const userObj = users[storedUser.username];
            if (!userObj) {
                showNotification('User not found', 'error');
                closeModal();
                return;
            }

            // Hash the entered password
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            if (hashedPassword === userObj.password) {
                // Remove goal from array
                goals = goals.filter(g => g.id !== goal.id);
                saveGoals();
                
                // Remove goal element with animation
                const goalElement = document.querySelector(`[data-id="${goal.id}"]`);
                if (goalElement) {
                    goalElement.classList.add('fade-out');
                    setTimeout(() => {
                        goalElement.remove();
                        updateStatistics();
                    }, 300);
                }

                closeModal();
                showNotification(`"${goal.title}" has been deleted`, 'success');
            } else {
                passwordError.classList.add('show');
                passwordInput.value = '';
                passwordInput.focus();
                
                // Remove error message after 3 seconds
                setTimeout(() => {
                    passwordError.classList.remove('show');
                }, 3000);
            }
        };

        // Close on outside click
        deleteModal.onclick = (e) => {
            if (e.target === deleteModal) closeModal();
        };

        // Focus password input
        setTimeout(() => passwordInput.focus(), 300);
    }

    // Add these styles to handle the fade-out animation
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                              type === 'error' ? 'fa-exclamation-circle' : 
                              'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add this function to show goal preview modal
    function showGoalPreview(goal) {
        const progress = (goal.currentAmount / goal.amount) * 100;
        const daysLeft = calculateDaysLeft(goal.deadline);
        
        const previewModal = document.createElement('div');
        previewModal.className = 'modal goal-preview-modal';
        previewModal.innerHTML = `
            <div class="modal-content preview-content">
                <div class="modal-header">
                    <h2>${goal.title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="preview-body">
                    ${goal.image ? `
                        <div class="preview-image-container">
                            <img src="${goal.image}" alt="${goal.title}" class="preview-image">
                        </div>
                    ` : ''}
                    <div class="preview-info">
                        <div class="preview-progress">
                            <div class="progress-bar large">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <p class="progress-text">${progress.toFixed(1)}% Complete</p>
                        </div>
                        
                        <div class="preview-details">
                            <div class="detail-item">
                                <i class="fas fa-money-bill-wave"></i>
                                <div>
                                    <h4>Target Amount</h4>
                                    <p>₹${goal.amount}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-piggy-bank"></i>
                                <div>
                                    <h4>Current Amount</h4>
                                    <p>₹${goal.currentAmount}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <h4>Time Remaining</h4>
                                    <p>${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-tag"></i>
                                <div>
                                    <h4>Category</h4>
                                    <p>${goal.category}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-flag"></i>
                                <div>
                                    <h4>Priority</h4>
                                    <p class="priority-${goal.priority}">${goal.priority}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="preview-description">
                            <h4>Description</h4>
                            <p>${goal.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(previewModal);
        previewModal.style.display = 'flex';

        // Close handlers
        const closeBtn = previewModal.querySelector('.close-modal');
        closeBtn.onclick = () => previewModal.remove();
        
        previewModal.onclick = (e) => {
            if (e.target === previewModal) previewModal.remove();
        };

        // Add this after the preview-description div in the preview-body
        if (goal.status !== 'achieved') {
            const moneyUpdateSection = document.createElement('div');
            moneyUpdateSection.className = 'progress-update-section';
            moneyUpdateSection.innerHTML = `
                <h4>Update Progress</h4>
                <div class="current-target-info">
                    <div class="amount-display">
                        <span>Current: <strong>₹${goal.currentAmount}</strong></span>
                        <span>Target: <strong>₹${goal.amount}</strong></span>
                    </div>
                    <div class="remaining-amount">
                        Remaining: <strong>₹${goal.amount - goal.currentAmount}</strong>
                    </div>
                </div>
                <div class="quick-add-grid">
                    <button class="quick-add-btn" data-amount="100">+₹100</button>
                    <button class="quick-add-btn" data-amount="500">+₹500</button>
                    <button class="quick-add-btn" data-amount="1000">+₹1000</button>
                    <button class="quick-add-btn" data-amount="5000">+₹5000</button>
                </div>
                <div class="custom-update">
                    <input type="number" 
                           class="custom-amount" 
                           placeholder="Enter amount" 
                           min="1" 
                           max="${goal.amount - goal.currentAmount}">
                    <button class="update-btn">Add Money</button>
                </div>
            `;

            previewModal.querySelector('.preview-body').appendChild(moneyUpdateSection);

            // Handle quick add buttons
            const quickAddBtns = moneyUpdateSection.querySelectorAll('.quick-add-btn');
            quickAddBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const amount = parseInt(btn.dataset.amount);
                    if (amount <= (goal.amount - goal.currentAmount)) {
                        updateGoalAmount(goal, amount);
                        previewModal.remove();
                    } else {
                        showNotification('Amount exceeds remaining target!', 'error');
                    }
                });
            });

            // Handle custom amount update
            const customInput = moneyUpdateSection.querySelector('.custom-amount');
            const updateBtn = moneyUpdateSection.querySelector('.update-btn');

            updateBtn.addEventListener('click', () => {
                const amount = parseInt(customInput.value);
                if (amount > 0 && amount <= (goal.amount - goal.currentAmount)) {
                    updateGoalAmount(goal, amount);
                    previewModal.remove();
                } else {
                    showNotification('Please enter a valid amount within the remaining target', 'error');
                }
            });

            // Add enter key support for custom amount
            customInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    updateBtn.click();
                }
            });
        }
    }

    // Update the updateGoalAmount function
    function updateGoalAmount(goal, addAmount) {
        const newAmount = goal.currentAmount + addAmount;
        
        if (newAmount > goal.amount) {
            showNotification('Amount exceeds target!', 'error');
            return;
        }

        const positiveMessages = [
            "Great progress! Keep it up! 🌟",
            "You're getting closer to your goal! 🎯",
            "Every step counts! 👣",
            "Amazing work! Keep going! 💪",
            "You're making it happen! ✨",
            "Fantastic progress! 🌈"
        ];
        
        const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
        const remaining = goal.amount - newAmount;

        goal.currentAmount = newAmount;
        
        // Add to history
        if (!goal.moneyHistory) goal.moneyHistory = [];
        goal.moneyHistory.push({
            amount: addAmount,
            date: new Date().toISOString(),
            user: JSON.parse(localStorage.getItem('currentUser')).username
        });
        
        // Update storage and display
        goals = goals.map(g => g.id === goal.id ? goal : g);
        saveGoals();
        
        showNotification(`
            Added ₹${addAmount}! ${randomMessage}
            ${remaining > 0 ? `\n₹${remaining} more to reach your goal!` : ''}
        `, 'success');
        
        if (newAmount >= goal.amount) {
            goal.status = 'achieved';
            showCelebration();
        }
        
        // Refresh display
        activeGoals.innerHTML = '';
        achievedGoals.innerHTML = '';
        goals.forEach(renderGoal);
        updateStatistics();
    }

    // Update the createConfetti function
    function createConfetti() {
        const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#ff6b6b', '#4834d4', '#be2edd', '#ff9f43'];
        const shapes = ['square', 'triangle', 'circle'];
        
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            
            // Random position across full width
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            
            // Random color
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random rotation
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // Random animation duration and delay
            const duration = Math.random() * 3 + 2; // 2-5 seconds
            const delay = Math.random() * 2; // 0-2 seconds delay
            
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.animationDelay = `${delay}s`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), (duration + delay) * 1000);
        }
    }

    // Add function to create falling emojis
    function createEmojis() {
        const emojis = ['🎉', '🎊', '🎈', '🎯', '⭐', '🌟', '✨', '💫', '🎆', '🎇'];
        
        for (let i = 0; i < 30; i++) {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            emoji.style.left = Math.random() * window.innerWidth + 'px';
            
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            emoji.style.animationDuration = `${duration}s`;
            emoji.style.animationDelay = `${delay}s`;
            
            document.body.appendChild(emoji);
            
            setTimeout(() => emoji.remove(), (duration + delay) * 1000);
        }
    }

    // Add function to create rising balloons
    function createBalloons() {
        const colors = ['#ff6b6b', '#4834d4', '#be2edd', '#ff9f43', '#00d2d3', '#ff4757'];
        
        for (let i = 0; i < 20; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            balloon.style.left = `${Math.random() * window.innerWidth}px`;
            const size = Math.random() * 30 + 30; // 30-60px
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.2}px`;
            
            const duration = Math.random() * 4 + 4; // 4-8s
            const delay = Math.random() * 3;
            
            balloon.style.animationDuration = `${duration}s`;
            balloon.style.animationDelay = `${delay}s`;
            
            document.body.appendChild(balloon);
            
            setTimeout(() => balloon.remove(), (duration + delay) * 1000);
        }
    }

    // Update the showCelebration function
    function showCelebration() {
        const celebrationModal = document.createElement('div');
        celebrationModal.className = 'celebration-modal show';
        celebrationModal.innerHTML = `
            <div class="modal-content">
                <h2>🎉 Congratulations! 🎊</h2>
                <p class="celebration-message">You've achieved your goal!</p>
                <div class="celebration-details">
                    <p>Keep up the great work! 🌟</p>
                    <p>Time to set new goals and reach higher! 🎯</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(celebrationModal);
        
        // Create multiple waves of celebrations
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createConfetti();
                createEmojis();
                createBalloons();
            }, i * 1000);
        }
        
        setTimeout(() => {
            celebrationModal.classList.add('fade-out');
            setTimeout(() => celebrationModal.remove(), 500);
        }, 6000);
    }
}); 