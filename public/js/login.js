import { authApi, setToken, isAuthenticated, showToast } from './api.js';

const form = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const alertBox = document.getElementById('login-alert');
const submitBtn = document.getElementById('login-submit-btn');

function initLoginPage() {
    if (isAuthenticated()) {
        redirectAfterLogin();
        return;
    }

    form.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

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
    submitBtn.textContent = 'LOGGING IN...';

    try {
        const response = await authApi.login({ email, password });
        if (response && response.token) {
            setToken(response.token);
            window.dispatchEvent(new CustomEvent('auth:change'));
            showToast('Welcome back to Fret Store!', 'success');
            setTimeout(() => {
                redirectAfterLogin();
            }, 500);
        }
    } catch (err) {
        showAlert(err.message || 'Invalid email or password');
        submitBtn.disabled = false;
        submitBtn.textContent = 'LOG IN';
    }
}

async function redirectAfterLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    if (redirectUrl && !redirectUrl.includes('login') && !redirectUrl.includes('register')) {
        window.location.href = redirectUrl;
        return;
    }

    try {
        const me = await authApi.getMe();
        if (me.role === 'admin') {
            window.location.href = '/pages/admin.html';
        } else {
            window.location.href = '/';
        }
    } catch (e) {
        window.location.href = '/';
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

function clearErrors() {
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    if (alertBox) {
        alertBox.textContent = '';
        alertBox.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', initLoginPage);
