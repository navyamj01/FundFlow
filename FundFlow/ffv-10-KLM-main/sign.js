document.addEventListener('DOMContentLoaded', () => {

    const getElement = (selector) => {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element not found: ${selector}`);
        }
        return element;
    };

    const signForm = getElement('.sign-form');
    const inputs = document.querySelectorAll('.text input');
    const usernameInput = getElement('input[placeholder="Username"]');
    const emailInput = getElement('input[placeholder="Email"]');
    const passwordInput = getElement('input[type="password"]');
    const submitBtn = getElement('button[type="submit"]');
    const heading = getElement('.heading');
    const emailField = getElement('.email-field');
    const toggleText = getElement('.toggle-text');

    if (!signForm || !usernameInput || !passwordInput) {
        console.error('Required form elements not found');
        return;
    }

    let isLoginMode = true;
    let isSubmitting = false; 

  
    const initializeForm = () => {
        emailField?.classList.add('hidden');
        updateFormSecurityHeaders();
    };

    // Security headers
    const updateFormSecurityHeaders = () => {
        // In a real app, these would be set server-side
        const headers = new Headers({
            'Content-Security-Policy': "default-src 'self'",
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        });
    };

    // Form toggle with improved animation handling
    const toggleFormMode = () => {
        if (isSubmitting) return;
        isLoginMode = !isLoginMode;

        signForm.classList.add('form-fade-out');

        const updateUI = () => {
            if (isLoginMode) {
                heading.textContent = 'Sign In';
                submitBtn.textContent = 'Sign In';
                toggleText.innerHTML = 'Don\'t have an account? <a href="#" class="toggle-link">Sign Up</a>';
                emailField?.classList.add('hidden');
                emailInput?.removeAttribute('required');
            } else {
                heading.textContent = 'Create Account';
                submitBtn.textContent = 'Sign Up';
                toggleText.innerHTML = 'Already have an account? <a href="#" class="toggle-link">Sign In</a>';
                emailField?.classList.remove('hidden');
                emailInput?.setAttribute('required', 'required');
            }

            signForm.reset();
            resetFormState();
        };

        setTimeout(() => {
            updateUI();
            signForm.classList.remove('form-fade-out');
            signForm.classList.add('form-fade-in');
            setTimeout(() => signForm.classList.remove('form-fade-in'), 300);
        }, 300);
    };

    // Improved form validation
    const validateForm = (username, email, password) => {
        const errors = [];

        if (!username?.trim()) {
            errors.push('Username is required');
        } else if (username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }

        if (!isLoginMode) {
            if (!email?.trim()) {
                errors.push('Email is required');
            } else if (!isValidEmail(email)) {
                errors.push('Please enter a valid email address');
            }
        }

        if (!password?.trim()) {
            errors.push('Password is required');
        } else if (!isLoginMode && !isValidPassword(password)) {
            errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        }

        return errors;
    };

    // Secure password handling
    const hashPassword = async (password) => {
        // In a real app, use a proper crypto library and salt
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    // Rate limiting
    const rateLimiter = (() => {
        const attempts = new Map();
        const MAX_ATTEMPTS = 5;
        const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

        return {
            checkLimit: (username) => {
                const userAttempts = attempts.get(username) || { count: 0, timestamp: Date.now() };
                
                if (userAttempts.count >= MAX_ATTEMPTS) {
                    const timeElapsed = Date.now() - userAttempts.timestamp;
                    if (timeElapsed < LOCKOUT_TIME) {
                        const minutesLeft = Math.ceil((LOCKOUT_TIME - timeElapsed) / 60000);
                        return `Too many attempts. Please try again in ${minutesLeft} minutes`;
                    }
                    attempts.delete(username);
                    return null;
                }
                return null;
            },
            incrementAttempts: (username) => {
                const userAttempts = attempts.get(username) || { count: 0, timestamp: Date.now() };
                userAttempts.count++;
                userAttempts.timestamp = Date.now();
                attempts.set(username, userAttempts);
            },
            resetAttempts: (username) => {
                attempts.delete(username);
            }
        };
    })();

    // Form submission with improved security
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const username = usernameInput.value.trim();
        const email = emailInput?.value.trim();
        const password = passwordInput.value.trim();

        // Check rate limiting
        const limitError = rateLimiter.checkLimit(username);
        if (limitError) {
            showNotification(limitError, 'error');
            return;
        }

        // Validate form
        const errors = validateForm(username, email, password);
        if (errors.length > 0) {
            showNotification(errors[0], 'error');
            return;
        }

        isSubmitting = true;
        submitBtn.disabled = true;

        try {
            const hashedPassword = await hashPassword(password);
            
            if (isLoginMode) {
                await handleLogin(username, hashedPassword);
            } else {
                await handleSignup(username, email, hashedPassword);
            }
        } catch (error) {
            console.error('Error during form submission:', error);
            showNotification('An error occurred. Please try again later.', 'error');
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
        }
    };

    // Improved login handling
    const handleLogin = async (username, hashedPassword) => {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[username];

            if (!user || user.password !== hashedPassword) {
                rateLimiter.incrementAttempts(username);
                throw new Error('Invalid credentials');
            }

            rateLimiter.resetAttempts(username);

            // Set session with expiration
            const session = {
                username,
                email: user.email,
                loginTime: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            localStorage.setItem('currentUser', JSON.stringify(session));
            showNotification('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } catch (error) {
            throw error;
        }
    };

    // Improved signup handling
    const handleSignup = async (username, email, hashedPassword) => {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (users[username]) {
            throw new Error('Username already exists');
        }

        users[username] = {
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Account created successfully!', 'success');

        setTimeout(toggleFormMode, 1500);
    };

    // Improved notification system
    const showNotification = (() => {
        let currentNotification = null;
        let timeoutId = null;

        return (message, type) => {
            if (currentNotification) {
                clearTimeout(timeoutId);
                currentNotification.remove();
            }

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            currentNotification = notification;
            
            // Force reflow
            notification.offsetHeight;
            
            setTimeout(() => notification.classList.add('show'), 10);
            
            timeoutId = setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                    currentNotification = null;
                }, 300);
            }, 3000);
        };
    })();

    // Utility functions
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isValidPassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    };

    const resetFormState = () => {
        inputs.forEach(input => {
            input.parentElement.classList.remove('focused');
        });
    };

    // Event listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-link')) {
            e.preventDefault();
            toggleFormMode();
        }
    });

    signForm.addEventListener('submit', handleSubmit);

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });

    // Initialize the form
    initializeForm();
});