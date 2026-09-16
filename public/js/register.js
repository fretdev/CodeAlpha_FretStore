import { authApi, setToken, isAuthenticated, showToast } from './api.js';

const form = document.getElementById('register-form');
const usernameInput = document.getElementById('reg-username');
const emailInput = document.getElementById('reg-email');
const passwordInput = document.getElementById('reg-password');
const usernameError = document.getElementById('username-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const alertBox = document.getElementById('register-alert');
const successBox = document.getElementById('register-success');
const submitBtn = document.getElementById('reg-submit-btn');

function initRegisterPage() {
    if (isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    form.addEventListener('submit', handleRegister);
}

async function handleRegister(e) {
    e.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

    if (!username) {
        showFieldError(usernameError, 'Username is required');
        hasError = true;
    } else if (username.length < 3) {
        showFieldError(usernameError, 'Username must be at least 3 characters');
        hasError = true;
    }

    if (!email) {
        showFieldError(emailError, 'Email address is required');
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError(emailError, 'Please enter a valid email address');
        hasError = true;
    }

    if (!password) {
        showFieldError(passwordError, 'Password is required');
        hasError = true;
    } else if (password.length < 8) {
        showFieldError(passwordError, 'Password must be at least 8 characters');
        hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'CREATING ACCOUNT...';

    try {
        await authApi.register({ username, email, password });
        
        showSuccess('Account created successfully! Logging you in...');
        
        try {
            const loginRes = await authApi.login({ email, password });
            if (loginRes && loginRes.token) {
                setToken(loginRes.token);
                window.dispatchEvent(new CustomEvent('auth:change'));
                showToast('Welcome to Fret Store!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 800);
                return;
            }
        } catch (loginErr) {
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 1200);
        }
    } catch (err) {
        showAlert(err.message || 'Registration failed. Please check your information.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'REGISTER ACCOUNT';
    }
}

function showFieldError(el, msg) {
    if (el) el.textContent = msg;
}

function showAlert(msg) {
    if (alertBox) {
        alertBox.textContent = msg;
        alertBox.style.display = 'block';
    }
}

function showSuccess(msg) {
    if (successBox) {
        successBox.textContent = msg;
        successBox.style.display = 'block';
    }
}

function clearErrors() {
    if (usernameError) usernameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    if (alertBox) {
        alertBox.textContent = '';
        alertBox.style.display = 'none';
    }
    if (successBox) {
        successBox.textContent = '';
        successBox.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', initRegisterPage);
