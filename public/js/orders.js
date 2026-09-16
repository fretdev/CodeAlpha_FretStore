import { ordersApi, formatPrice, formatDate, isAuthenticated, escapeHtml } from './api.js';

let myOrders = [];
const orderDetailsCache = new Map();

const loadingEl = document.getElementById('orders-loading');
const authRequiredEl = document.getElementById('orders-auth-required');
const emptyEl = document.getElementById('orders-empty');
const errorEl = document.getElementById('orders-error');
const errorMsgEl = document.getElementById('orders-error-msg');
const ordersContainerEl = document.getElementById('orders-container');
const newOrderBannerEl = document.getElementById('new-order-banner');
const newOrderIdEl = document.getElementById('new-order-id');
const retryBtn = document.getElementById('orders-retry-btn');

async function initOrdersPage() {
    if (!isAuthenticated()) {
        showAuthRequired();
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const newOrderId = urlParams.get('orderId');
    if (newOrderId && newOrderBannerEl) {
        if (newOrderIdEl) newOrderIdEl.textContent = `#${newOrderId}`;
        newOrderBannerEl.style.display = 'block';
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', loadOrders);
    }

    await loadOrders();
}

async function loadOrders() {
    showLoading();
    try {
        const orders = await ordersApi.getMyOrders();
        myOrders = Array.isArray(orders) ? orders : [];

        if (myOrders.length === 0) {
            showEmpty();
        } else {
            renderOrders();
        }
    } catch (err) {
        if (err.status === 401) {
            showAuthRequired();
        } else {
            showError(err.message || 'Failed to retrieve orders.');
        }
    }
}

function renderOrders() {
    hideLoading();
    hideEmpty();
    hideError();
    if (ordersContainerEl) ordersContainerEl.style.display = 'flex';

    if (ordersContainerEl) {
        ordersContainerEl.innerHTML = myOrders.map(order => {
            const statusBadge = getStatusBadge(order.status);
            return `
                <article class="order-card" id="order-card-${order.id}">
                    <div class="order-header">
                        <div class="order-id-date">
                            <span class="order-id">ORDER #${order.id}</span>
                            <span class="order-date">${formatDate(order.created_at)}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-md);">
                            ${statusBadge}
                            <button type="button" class="btn btn-outline btn-sm toggle-details-btn" data-id="${order.id}">
                                VIEW DETAILS
                            </button>
                        </div>
                    </div>
                    <div class="order-body">
                        <div class="order-details-container" id="details-container-${order.id}" style="display: none;">
                            <div class="loading-wrapper" style="padding: var(--space-md);">
                                <div class="spinner"></div>
                            </div>
                        </div>
                        <div class="order-footer">
                            <span style="color: var(--color-text-dim); font-size: 0.9rem;">Order Total</span>
                            <span class="product-price">${formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        ordersContainerEl.querySelectorAll('.toggle-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                toggleOrderDetails(id, btn);
            });
        });
    }
}

async function toggleOrderDetails(orderId, btn) {
    const detailsContainer = document.getElementById(`details-container-${orderId}`);
    if (!detailsContainer) return;

    const isExpanded = detailsContainer.style.display !== 'none';

    if (isExpanded) {
        detailsContainer.style.display = 'none';
        btn.textContent = 'VIEW DETAILS';
        return;
    }

    detailsContainer.style.display = 'block';
    btn.textContent = 'HIDE DETAILS';

    if (orderDetailsCache.has(orderId)) {
        renderOrderItems(detailsContainer, orderDetailsCache.get(orderId));
        return;
    }

    try {
        const orderData = await ordersApi.getMyOrderById(orderId);
        orderDetailsCache.set(orderId, orderData);
        renderOrderItems(detailsContainer, orderData);
    } catch (err) {
        detailsContainer.innerHTML = `
            <p class="form-error" style="padding: var(--space-sm) 0;">
                Unable to load item details: ${escapeHtml(err.message)}
            </p>
        `;
    }
}

function renderOrderItems(container, orderData) {
    const items = orderData.items || [];
    if (!items.length) {
        container.innerHTML = `<p style="padding: var(--space-sm) 0; color: var(--color-text-dim);">No items recorded for this order.</p>`;
        return;
    }

    const itemsHtml = `
        <div class="order-items-list" style="margin: var(--space-sm) 0 var(--space-md);">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-dim); text-transform: uppercase; border-bottom: 1px solid var(--color-border); padding-bottom: 4px; margin-bottom: var(--space-xs); display: flex; justify-content: space-between;">
                <span>Instrument / Item</span>
                <span>Qty &times; Price</span>
            </div>
            ${items.map(item => {
                const unitPrice = Number(item.unit_price) || 0;
                const qty = Number(item.quantity) || 1;
                const subtotal = unitPrice * qty;

                return `
                    <div class="order-item-row">
                        <div>
                            <strong style="color: var(--color-text);">${escapeHtml(item.product_name || 'Instrument')}</strong>
                            <div style="font-size: 0.8rem; color: var(--color-text-dim);">Item ID: #${item.product_id}</div>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: var(--color-text); font-weight: 600;">${formatPrice(subtotal)}</span>
                            <div style="font-size: 0.8rem; color: var(--color-text-dim);">${qty} &times; ${formatPrice(unitPrice)}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = itemsHtml;
}

function getStatusBadge(status) {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
        case 'pending':
            return '<span class="badge badge-gold">Pending</span>';
        case 'processing':
            return '<span class="badge badge-crimson">Processing</span>';
        case 'shipped':
            return '<span class="badge badge-gold">Shipped</span>';
        case 'delivered':
            return '<span class="badge badge-green">Delivered</span>';
        case 'cancelled':
            return '<span class="badge badge-danger">Cancelled</span>';
        default:
            return `<span class="badge badge-gray">${escapeHtml(status)}</span>`;
    }
}

function showLoading() {
    if (loadingEl) loadingEl.style.display = 'flex';
    if (authRequiredEl) authRequiredEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (ordersContainerEl) ordersContainerEl.style.display = 'none';
}

function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
}

function showAuthRequired() {
    hideLoading();
    if (ordersContainerEl) ordersContainerEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (authRequiredEl) authRequiredEl.style.display = 'flex';
}

function showEmpty() {
    hideLoading();
    if (ordersContainerEl) ordersContainerEl.style.display = 'none';
    if (authRequiredEl) authRequiredEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
}

function hideEmpty() {
    if (emptyEl) emptyEl.style.display = 'none';
}

function showError(msg) {
    hideLoading();
    if (ordersContainerEl) ordersContainerEl.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', initOrdersPage);
