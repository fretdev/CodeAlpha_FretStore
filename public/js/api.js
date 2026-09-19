const API_BASE = '/api';

export function getToken() {
    return localStorage.getItem('fretstore_token');
}

export function setToken(token) {
    if (token) {
        localStorage.setItem('fretstore_token', token);
    } else {
        localStorage.removeItem('fretstore_token');
    }
}

export function removeToken() {
    localStorage.removeItem('fretstore_token');
}

export function isAuthenticated() {
    return !!getToken();
}

export async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            if (token) {
                removeToken();
                window.dispatchEvent(new CustomEvent('auth:expired'));
            }
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.message || (data?.errors && data.errors.map(e => e.message).join(', ')) || `HTTP ${response.status}: Request failed`;
            const error = new Error(errorMsg);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (!err.status) {
            err.message = 'Network error. Please check your connection.';
        }
        throw err;
    }
}

export const authApi = {
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () => request('/auth/me', { method: 'GET' }),
    logout: () => {
        removeToken();
        window.dispatchEvent(new CustomEvent('auth:change'));
    }
};

export const categoriesApi = {
    getAll: () => request('/categories', { method: 'GET' })
};

export const productsApi = {
    getAll: () => request('/products', { method: 'GET' }),
    getById: (id) => request(`/products/${id}`, { method: 'GET' }),
    create: (productData) => request('/products', { method: 'POST', body: productData }),
    update: (id, updates) => request(`/products/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' })
};

export const cartApi = {
    get: () => request('/cart', { method: 'GET' }),
    addItem: (productId, quantity = 1) => request('/cart/items', { method: 'POST', body: { productId: Number(productId), quantity: Number(quantity) } }),
    updateItem: (cartItemId, quantity) => request(`/cart/items/${cartItemId}`, { method: 'PATCH', body: { quantity: Number(quantity) } }),
    removeItem: (cartItemId) => request(`/cart/items/${cartItemId}`, { method: 'DELETE' })
};

export const ordersApi = {
    create: () => request('/orders', { method: 'POST' }),
    getMyOrders: () => request('/orders', { method: 'GET' }),
    getMyOrderById: (id) => request(`/orders/${id}`, { method: 'GET' }),
    cancel: (id) => request(`/orders/${id}/cancel`, { method: 'PATCH' }),
    getAdminAllOrders: () => request('/orders/admin', { method: 'GET' }),
    getAdminOrderById: (id) => request(`/orders/admin/${id}`, { method: 'GET' }),
    updateAdminOrderStatus: (id, status) => request(`/orders/admin/${id}`, { method: 'PATCH', body: { status } })
};

export function formatPrice(amount) {
    const num = Number(amount);
    if (isNaN(num)) return '₦0.00';
    return '₦' + num.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 250);
        }
    }, duration);
}
