import { authApi, productsApi, categoriesApi, ordersApi, formatPrice, formatDate, showToast, escapeHtml } from './api.js';

let categories = [];
let products = [];
let orders = [];
let isEditing = false;
let currentEditingProductId = null;

const authLoadingEl = document.getElementById('admin-auth-loading');
const accessDeniedEl = document.getElementById('admin-access-denied');
const mainInterfaceEl = document.getElementById('admin-main-interface');

const tabProductsBtn = document.getElementById('tab-btn-products');
const tabOrdersBtn = document.getElementById('tab-btn-orders');
const productsView = document.getElementById('admin-products-view');
const ordersView = document.getElementById('admin-orders-view');

const productsTbody = document.getElementById('admin-products-tbody');
const ordersTbody = document.getElementById('admin-orders-tbody');
const btnOpenCreateProduct = document.getElementById('btn-open-create-product');

const productModal = document.getElementById('product-modal');
const productModalTitle = document.getElementById('product-modal-title');
const productModalForm = document.getElementById('product-modal-form');
const productModalClose = document.getElementById('product-modal-close');
const productModalCancel = document.getElementById('product-modal-cancel');
const productFormAlert = document.getElementById('product-form-alert');

const modalCategorySelect = document.getElementById('modal-product-category');
const modalBrandInput = document.getElementById('modal-product-brand');
const modalNameInput = document.getElementById('modal-product-name');
const modalPriceInput = document.getElementById('modal-product-price');
const modalStockInput = document.getElementById('modal-product-stock');
const modalImageInput = document.getElementById('modal-product-image');
const modalDescInput = document.getElementById('modal-product-desc');

const orderModal = document.getElementById('order-modal');
const orderModalBody = document.getElementById('order-modal-body');
const orderModalClose = document.getElementById('order-modal-close');
const orderModalDone = document.getElementById('order-modal-done');

async function initAdminPage() {
    try {
        const me = await authApi.getMe();
        if (me.role !== 'admin') {
            showAccessDenied();
            return;
        }

        if (authLoadingEl) authLoadingEl.style.display = 'none';
        if (mainInterfaceEl) mainInterfaceEl.style.display = 'block';

        setupEventListeners();
        await loadCategories();
        await loadProducts();
    } catch (err) {
        showAccessDenied();
    }
}

function showAccessDenied() {
    if (authLoadingEl) authLoadingEl.style.display = 'none';
    if (mainInterfaceEl) mainInterfaceEl.style.display = 'none';
    if (accessDeniedEl) accessDeniedEl.style.display = 'flex';
}

function setupEventListeners() {
    tabProductsBtn.addEventListener('click', () => switchTab('products'));
    tabOrdersBtn.addEventListener('click', () => switchTab('orders'));

    btnOpenCreateProduct.addEventListener('click', openCreateProductModal);

    productModalClose.addEventListener('click', closeProductModal);
    productModalCancel.addEventListener('click', closeProductModal);
    productModalForm.addEventListener('submit', handleProductFormSubmit);

    orderModalClose.addEventListener('click', closeOrderModal);
    orderModalDone.addEventListener('click', closeOrderModal);

    window.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
        if (e.target === orderModal) closeOrderModal();
    });
}

function switchTab(tab) {
    if (tab === 'products') {
        tabProductsBtn.classList.add('active');
        tabOrdersBtn.classList.remove('active');
        productsView.style.display = 'block';
        ordersView.style.display = 'none';
        btnOpenCreateProduct.style.display = 'inline-flex';
        loadProducts();
    } else {
        tabOrdersBtn.classList.add('active');
        tabProductsBtn.classList.remove('active');
        productsView.style.display = 'none';
        ordersView.style.display = 'block';
        btnOpenCreateProduct.style.display = 'none';
        loadOrders();
    }
}

async function loadCategories() {
    try {
        categories = await categoriesApi.getAll();
        if (modalCategorySelect) {
            modalCategorySelect.innerHTML = '<option value="">Select Category</option>' +
                categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        }
    } catch (err) {
        console.warn('Failed to load categories:', err.message);
    }
}

async function loadProducts() {
    try {
        products = await productsApi.getAll();
        renderProductsTable();
    } catch (err) {
        productsTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--color-danger); padding: var(--space-xl);">
                    Failed to load products: ${escapeHtml(err.message)}
                </td>
            </tr>
        `;
    }
}

function renderProductsTable() {
    if (!products.length) {
        productsTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--color-text-dim); padding: var(--space-xl);">
                    No instruments in catalog. Click "+ Add New Product" to create one.
                </td>
            </tr>
        `;
        return;
    }

    const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23222222'/%3E%3C/svg%3E";

    productsTbody.innerHTML = products.map(p => {
        const stock = Number(p.stock_quantity) || 0;
        const stockBadge = stock <= 0 
            ? `<span class="badge badge-danger">0 Out</span>`
            : stock <= 3 
                ? `<span class="badge badge-gold">${stock} Low</span>`
                : `<span class="badge badge-green">${stock} In</span>`;

        return `
            <tr>
                <td>
                    <img src="${escapeHtml(p.image_url || fallbackImg)}" alt="${escapeHtml(p.name)}" class="table-thumb" onerror="this.src='${fallbackImg}';">
                </td>
                <td><strong>#${p.id}</strong></td>
                <td>${escapeHtml(p.brand || '—')}</td>
                <td><strong style="color: var(--color-text);">${escapeHtml(p.name)}</strong></td>
                <td><span class="badge badge-gray">${escapeHtml(p.category || '—')}</span></td>
                <td><strong style="color: var(--color-text);">${formatPrice(p.price)}</strong></td>
                <td>${stockBadge}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="btn btn-outline btn-sm btn-edit-product" data-id="${p.id}">Edit</button>
                        <button type="button" class="btn btn-danger btn-sm btn-delete-product" data-id="${p.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    productsTbody.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', () => openEditProductModal(Number(btn.dataset.id)));
    });

    productsTbody.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteProduct(Number(btn.dataset.id)));
    });
}

function openCreateProductModal() {
    isEditing = false;
    currentEditingProductId = null;
    productModalTitle.textContent = 'ADD NEW PRODUCT';
    productModalForm.reset();
    clearProductModalAlert();
    productModal.style.display = 'flex';
}

function openEditProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    isEditing = true;
    currentEditingProductId = productId;
    productModalTitle.textContent = `EDIT PRODUCT #${product.id}`;
    clearProductModalAlert();

    const matchingCat = categories.find(c => c.name.toLowerCase() === (product.category || '').toLowerCase());
    if (matchingCat) {
        modalCategorySelect.value = matchingCat.id;
    }

    modalBrandInput.value = product.brand || '';
    modalNameInput.value = product.name || '';
    modalPriceInput.value = Number(product.price) || '';
    modalStockInput.value = Number(product.stock_quantity) ?? '';
    modalImageInput.value = product.image_url || '';
    modalDescInput.value = product.description || '';

    productModal.style.display = 'flex';
}

function closeProductModal() {
    productModal.style.display = 'none';
    productModalForm.reset();
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    clearProductModalAlert();

    const categoryId = Number(modalCategorySelect.value);
    const brand = modalBrandInput.value.trim();
    const name = modalNameInput.value.trim();
    const price = Number(modalPriceInput.value);
    const stockQuantity = Number(modalStockInput.value);
    const imageUrl = modalImageInput.value.trim();
    const description = modalDescInput.value.trim();

    if (!categoryId || !name || !brand || isNaN(price) || price <= 0 || isNaN(stockQuantity) || stockQuantity < 0) {
        showProductModalAlert('Please fill out all required fields with valid values.');
        return;
    }

    const payload = {
        categoryId,
        name,
        brand,
        price,
        stockQuantity
    };

    if (description) payload.description = description;
    if (imageUrl) payload.imageUrl = imageUrl;

    const submitBtn = document.getElementById('product-modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SAVING...';

    try {
        if (isEditing) {
            const updatePayload = {
                name,
                price,
                stockQuantity,
                categoryId
            };
            if (description !== undefined) updatePayload.description = description;
            if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl;

            await productsApi.update(currentEditingProductId, updatePayload);
            showToast('Product updated successfully!', 'success');
        } else {
            await productsApi.create(payload);
            showToast('New product created successfully!', 'success');
        }

        closeProductModal();
        await loadProducts();
    } catch (err) {
        showProductModalAlert(err.message || 'Failed to save product.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SAVE PRODUCT';
    }
}

async function handleDeleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    const productName = product ? product.name : `Product #${productId}`;

    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await productsApi.delete(productId);
        showToast(`"${productName}" deleted successfully`, 'info');
        await loadProducts();
    } catch (err) {
        showToast(err.message || 'Failed to delete product', 'error');
    }
}

function showProductModalAlert(msg) {
    if (productFormAlert) {
        productFormAlert.textContent = msg;
        productFormAlert.style.display = 'block';
    }
}

function clearProductModalAlert() {
    if (productFormAlert) {
        productFormAlert.textContent = '';
        productFormAlert.style.display = 'none';
    }
}

async function loadOrders() {
    try {
        orders = await ordersApi.getAdminAllOrders();
        renderOrdersTable();
    } catch (err) {
        ordersTbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--color-danger); padding: var(--space-xl);">
                    Failed to load customer orders: ${escapeHtml(err.message)}
                </td>
            </tr>
        `;
    }
}

function renderOrdersTable() {
    if (!orders.length) {
        ordersTbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--color-text-dim); padding: var(--space-xl);">
                    No customer orders received yet.
                </td>
            </tr>
        `;
        return;
    }

    ordersTbody.innerHTML = orders.map(o => {
        const statusBadge = getStatusBadge(o.status);

        return `
            <tr>
                <td><strong>#${o.id}</strong></td>
                <td>
                    <div style="color: var(--color-text); font-weight: 500;">${escapeHtml(o.username || 'Customer')}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-dim);">${escapeHtml(o.email || '')}</div>
                </td>
                <td>${formatDate(o.created_at)}</td>
                <td><strong style="color: var(--color-text);">${formatPrice(o.total_amount)}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <button type="button" class="btn btn-outline btn-sm btn-manage-order" data-id="${o.id}">
                        Manage Order
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    ordersTbody.querySelectorAll('.btn-manage-order').forEach(btn => {
        btn.addEventListener('click', () => openManageOrderModal(Number(btn.dataset.id)));
    });
}

async function openManageOrderModal(orderId) {
    orderModal.style.display = 'flex';
    orderModalBody.innerHTML = '<div class="loading-wrapper"><div class="spinner"></div><p>Loading order details...</p></div>';

    try {
        const data = await ordersApi.getAdminOrderById(orderId);
        const order = data.order || {};
        const items = data.items || [];

        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        orderModalBody.innerHTML = `
            <div style="margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                    <h4 style="font-size: 1.25rem;">ORDER #${order.id}</h4>
                    <span>${formatDate(order.created_at)}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--color-text-muted);">
                    <strong>Customer:</strong> ${escapeHtml(order.username || 'N/A')} (${escapeHtml(order.email || 'N/A')})
                </div>
            </div>

            <div style="margin-bottom: var(--space-md);">
                <label for="order-status-select" class="form-label">Update Order Status:</label>
                <div style="display: flex; gap: var(--space-sm); align-items: center;">
                    <select id="order-status-select" class="form-select" style="max-width: 240px;">
                        ${statuses.map(s => `
                            <option value="${s}" ${order.status === s ? 'selected' : ''}>
                                ${s.toUpperCase()}
                            </option>
                        `).join('')}
                    </select>
                    <button type="button" class="btn btn-primary btn-sm" id="btn-update-status" data-id="${order.id}">
                        UPDATE STATUS
                    </button>
                </div>
            </div>

            <h5 style="font-size: 1.1rem; margin-top: var(--space-md); margin-bottom: var(--space-xs);">ITEMIZED BREAKDOWN</h5>
            <div class="table-responsive" style="margin-bottom: var(--space-md);">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => {
                            const unitPrice = Number(item.unit_price) || 0;
                            const qty = Number(item.quantity) || 1;
                            return `
                                <tr>
                                    <td><strong>${escapeHtml(item.product_name)}</strong></td>
                                    <td>${formatPrice(unitPrice)}</td>
                                    <td>${qty}</td>
                                    <td><strong>${formatPrice(unitPrice * qty)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.15rem; font-weight: 700; color: var(--color-text); border-top: 1px solid var(--color-border); padding-top: var(--space-sm);">
                <span>Total Amount</span>
                <span>${formatPrice(order.total_amount)}</span>
            </div>
        `;

        const updateStatusBtn = document.getElementById('btn-update-status');
        const statusSelect = document.getElementById('order-status-select');

        updateStatusBtn.addEventListener('click', async () => {
            const newStatus = statusSelect.value;
            updateStatusBtn.disabled = true;
            updateStatusBtn.textContent = 'UPDATING...';

            try {
                await ordersApi.updateAdminOrderStatus(order.id, newStatus);
                showToast(`Order #${order.id} status updated to ${newStatus.toUpperCase()}`, 'success');
                await loadOrders();
                closeOrderModal();
            } catch (statusErr) {
                showToast(statusErr.message || 'Failed to update order status', 'error');
                updateStatusBtn.disabled = false;
                updateStatusBtn.textContent = 'UPDATE STATUS';
            }
        });
    } catch (err) {
        orderModalBody.innerHTML = `
            <p class="form-error">Failed to load order details: ${escapeHtml(err.message)}</p>
        `;
    }
}

function closeOrderModal() {
    orderModal.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', initAdminPage);
