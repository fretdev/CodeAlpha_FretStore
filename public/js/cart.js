import { cartApi, ordersApi, formatPrice, isAuthenticated, showToast, escapeHtml } from './api.js';

let cartItems = [];

const loadingEl = document.getElementById('cart-loading');
const authRequiredEl = document.getElementById('cart-auth-required');
const emptyEl = document.getElementById('cart-empty');
const errorEl = document.getElementById('cart-error');
const errorMsgEl = document.getElementById('cart-error-msg');
const contentEl = document.getElementById('cart-content');
const itemsListEl = document.getElementById('cart-items-list');
const itemCountEl = document.getElementById('cart-item-count');
const subtotalEl = document.getElementById('summary-subtotal');
const totalEl = document.getElementById('summary-total');
const checkoutBtn = document.getElementById('checkout-btn');
const retryBtn = document.getElementById('cart-retry-btn');

async function initCartPage() {
    if (!isAuthenticated()) {
        showAuthRequired();
        return;
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', loadCart);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handlePlaceOrder);
    }

    await loadCart();
}

async function loadCart() {
    showLoading();
    try {
        const items = await cartApi.get();
        cartItems = Array.isArray(items) ? items : [];

        if (cartItems.length === 0) {
            showEmpty();
        } else {
            renderCart();
        }
    } catch (err) {
        if (err.status === 401) {
            showAuthRequired();
        } else {
            showError(err.message || 'Failed to load cart items.');
        }
    }
}

function renderCart() {
    hideLoading();
    hideEmpty();
    hideError();
    if (authRequiredEl) authRequiredEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'grid';

    updateItemCount();

    const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90' viewBox='0 0 120 90'%3E%3Crect width='120' height='90' fill='%23181818'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23706C64'%3EInstrument%3C/text%3E%3C/svg%3E";

    if (itemsListEl) {
        itemsListEl.innerHTML = cartItems.map(item => {
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;
            const itemSubtotal = itemPrice * itemQty;

            return `
                <div class="cart-item-card" data-id="${item.id}">
                    <img 
                        src="${escapeHtml(item.image_url || fallbackImg)}" 
                        alt="${escapeHtml(item.name)}" 
                        class="cart-item-img"
                        loading="lazy"
                        decoding="async"
                        onerror="this.onerror=null;this.src='${fallbackImg}';"
                    />
                    <div class="cart-item-info">
                        <span class="product-brand">${escapeHtml(item.brand || 'Fret Store')}</span>
                        <h3 class="cart-item-title">${escapeHtml(item.name)}</h3>
                        <span class="cart-item-price">${formatPrice(itemPrice)} each</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button type="button" class="qty-btn btn-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                            <input type="number" class="qty-input" value="${itemQty}" min="1" readonly>
                            <button type="button" class="qty-btn btn-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                        </div>
                        <span class="cart-item-subtotal">${formatPrice(itemSubtotal)}</span>
                        <button type="button" class="cart-remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        itemsListEl.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const item = cartItems.find(i => Number(i.id) === id);
                if (item && item.quantity > 1) {
                    updateQuantity(id, item.quantity - 1);
                }
            });
        });

        itemsListEl.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const item = cartItems.find(i => Number(i.id) === id);
                if (item) {
                    updateQuantity(id, item.quantity + 1);
                }
            });
        });

        itemsListEl.querySelectorAll('.cart-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                removeItem(id);
            });
        });
    }

    updateSummary();
}

function updateItemCount() {
    const totalCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    if (itemCountEl) {
        itemCountEl.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''} in your cart`;
    }
}

function updateSummary() {
    const totalAmount = cartItems.reduce((acc, item) => {
        return acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);

    const formatted = formatPrice(totalAmount);
    if (subtotalEl) subtotalEl.textContent = formatted;
    if (totalEl) totalEl.textContent = formatted;
}

async function updateQuantity(cartItemId, newQuantity) {
    try {
        await cartApi.updateItem(cartItemId, newQuantity);
        const item = cartItems.find(i => Number(i.id) === Number(cartItemId));
        if (item) item.quantity = newQuantity;
        
        const cardEl = itemsListEl.querySelector(`.cart-item-card[data-id="${cartItemId}"]`);
        if (cardEl) {
            const input = cardEl.querySelector('.qty-input');
            const subtotal = cardEl.querySelector('.cart-item-subtotal');
            if (input) input.value = newQuantity;
            if (subtotal && item) {
                subtotal.textContent = formatPrice((Number(item.price) || 0) * newQuantity);
            }
        }
        
        updateItemCount();
        updateSummary();
        window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (err) {
        showToast(err.message || 'Unable to update quantity (may exceed available stock)', 'error');
    }
}

async function removeItem(cartItemId) {
    const cardEl = itemsListEl ? itemsListEl.querySelector(`.cart-item-card[data-id="${cartItemId}"]`) : null;
    if (cardEl) {
        cardEl.classList.add('is-removing');
    }

    try {
        await cartApi.removeItem(cartItemId);
        
        cartItems = cartItems.filter(i => Number(i.id) !== Number(cartItemId));
        
        if (cardEl) {
            setTimeout(() => cardEl.remove(), 150);
        }

        updateItemCount();
        updateSummary();
        window.dispatchEvent(new CustomEvent('cart:updated'));

        showToast('Item removed from cart', 'info');

        if (cartItems.length === 0) {
            setTimeout(() => showEmpty(), 200);
        }
    } catch (err) {
        if (cardEl) {
            cardEl.classList.remove('is-removing');
        }
        showToast(err.message || 'Failed to remove item from cart', 'error');
    }
}

async function handlePlaceOrder() {
    if (!cartItems.length) {
        showToast('Your cart is empty', 'error');
        return;
    }

    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'PROCESSING ORDER...';
    }

    try {
        const response = await ordersApi.create();
        cartItems = [];
        window.dispatchEvent(new CustomEvent('cart:updated'));
        showToast('Order placed successfully!', 'success');
        
        setTimeout(() => {
            const orderId = response?.orderId || '';
            window.location.href = `/pages/orders.html?orderId=${orderId}`;
        }, 1000);
    } catch (err) {
        showToast(err.message || 'Failed to create order. Please check stock availability.', 'error');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'PLACE ORDER';
        }
    }
}

function showLoading() {
    if (loadingEl) loadingEl.style.display = 'flex';
    if (authRequiredEl) authRequiredEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
}

function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
}

function showAuthRequired() {
    hideLoading();
    if (contentEl) contentEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (authRequiredEl) authRequiredEl.style.display = 'flex';
}

function showEmpty() {
    hideLoading();
    if (contentEl) contentEl.style.display = 'none';
    if (authRequiredEl) authRequiredEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (itemCountEl) itemCountEl.textContent = '0 items in your cart';
}

function hideEmpty() {
    if (emptyEl) emptyEl.style.display = 'none';
}

function showError(msg) {
    hideLoading();
    if (contentEl) contentEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (authRequiredEl) authRequiredEl.style.display = 'none';
    if (errorEl) {
        errorEl.style.display = 'flex';
        if (errorMsgEl) errorMsgEl.textContent = msg;
    }
}

function hideError() {
    if (errorEl) errorEl.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', initCartPage);
