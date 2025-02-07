document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.tab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                registerForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            }
            // Clear error messages when switching tabs
            loginError.textContent = '';
            registerError.textContent = '';
        });
    });

    // Register handler
    registerButton.addEventListener('click', async () => {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Clear previous error
        registerError.textContent = '';

        // Validate inputs
        if (!username || !password || !confirmPassword) {
            registerError.textContent = 'All fields are required';
            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            registerError.textContent = 'Password must be at least 6 characters';
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Registration successful
                window.location.href = '/chat.html';
            } else {
                // Show specific error from server
                registerError.textContent = data.error || 'Registration failed';
            }
        } catch (error) {
            console.error('Registration error:', error);
            registerError.textContent = 'Network error. Please try again.';
        }
    });

    // Login handler
    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Clear previous error
        loginError.textContent = '';

        // Validate inputs
        if (!username || !password) {
            loginError.textContent = 'Both username and password are required';
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                window.location.href = '/chat.html';
            } else {
                loginError.textContent = data.error || 'Invalid username or password';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'Network error. Please try again.';
        }
    });
}); 