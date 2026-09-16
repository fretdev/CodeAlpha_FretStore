import { productsApi, cartApi, formatPrice, isAuthenticated, showToast, escapeHtml } from './api.js';

let currentProduct = null;
let currentQuantity = 1;

const loadingEl = document.getElementById('product-loading');
const errorEl = document.getElementById('product-error');
const errorTitleEl = document.getElementById('product-error-title');
const errorMsgEl = document.getElementById('product-error-msg');
const detailContainerEl = document.getElementById('product-detail-container');

const imgEl = document.getElementById('product-img');
const brandEl = document.getElementById('product-brand');
const categoryEl = document.getElementById('product-category');
const titleEl = document.getElementById('product-title');
const priceEl = document.getElementById('product-price');
const descEl = document.getElementById('product-description');
const stockQtyEl = document.getElementById('product-stock-qty');
const catNameEl = document.getElementById('product-cat-name');
const idDisplayEl = document.getElementById('product-id-display');
const stockBadgeContainer = document.getElementById('stock-badge-container');

const qtyMinusBtn = document.getElementById('qty-minus');
const qtyPlusBtn = document.getElementById('qty-plus');
const qtyInput = document.getElementById('qty-input');
const addToCartBtn = document.getElementById('add-to-cart-btn');

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId || isNaN(Number(productId)) || Number(productId) <= 0) {
        showError('Invalid Product ID', 'The product link is invalid or missing.');
        return;
    }

    setupQuantityListeners();
    await loadProduct(Number(productId));
}

async function loadProduct(id) {
    showLoading();
    try {
        const product = await productsApi.getById(id);
        if (!product) {
            showError('Product Not Found', 'The requested instrument could not be found.');
            return;
        }

        currentProduct = product;
        renderProductDetails(product);
        hideLoading();
    } catch (err) {
        if (err.status === 404) {
            showError('Product Not Found', 'This instrument does not exist in our catalog.');
        } else {
            showError('Unable to Load Product', err.message || 'A network error occurred.');
        }
    }
}

function renderProductDetails(product) {
    document.title = `${product.name} | FRET STORE`;

    const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23181818'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23706C64'%3EInstrument Image%3C/text%3E%3C/svg%3E";

    if (imgEl) {
        imgEl.src = product.image_url || fallbackImg;
        imgEl.alt = product.name;
        imgEl.setAttribute('decoding', 'async');
        imgEl.setAttribute('fetchpriority', 'high');
        imgEl.onerror = () => { imgEl.src = fallbackImg; };
    }

    if (brandEl) brandEl.textContent = product.brand || 'Fret Store';
    if (categoryEl) categoryEl.textContent = product.category || 'Instrument';
    if (catNameEl) catNameEl.textContent = product.category || 'Instrument';
    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = formatPrice(product.price);
    if (descEl) descEl.textContent = product.description || 'No description available for this instrument.';
    if (idDisplayEl) idDisplayEl.textContent = `#${product.id}`;

    const stock = Number(product.stock_quantity) || 0;
    if (stockQtyEl) {
        stockQtyEl.textContent = stock > 0 ? `${stock} units available` : 'Out of stock';
    }

    if (stockBadgeContainer) {
        if (stock <= 0) {
            stockBadgeContainer.innerHTML = '<span class="badge badge-danger">Out of Stock</span>';
        } else if (stock <= 3) {
            stockBadgeContainer.innerHTML = `<span class="badge badge-gold">Low Stock &mdash; Only ${stock} units left</span>`;
        } else {
            stockBadgeContainer.innerHTML = '<span class="badge badge-green">In Stock &amp; Ready to Ship</span>';
        }
    }

    if (qtyInput) {
        qtyInput.max = stock;
        qtyInput.value = stock > 0 ? 1 : 0;
        currentQuantity = stock > 0 ? 1 : 0;
    }

    if (addToCartBtn) {
        if (stock <= 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'OUT OF STOCK';
            if (qtyMinusBtn) qtyMinusBtn.disabled = true;
            if (qtyPlusBtn) qtyPlusBtn.disabled = true;
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'ADD TO CART';
            addToCartBtn.onclick = handleAddToCart;
        }
    }

    if (detailContainerEl) detailContainerEl.style.display = 'grid';
}

function setupQuantityListeners() {
    if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                if (qtyInput) qtyInput.value = currentQuantity;
            }
        });
    }

    if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', () => {
            const maxStock = currentProduct ? Number(currentProduct.stock_quantity) : 1;
            if (currentQuantity < maxStock) {
                currentQuantity++;
                if (qtyInput) qtyInput.value = currentQuantity;
            } else {
                showToast(`Maximum available stock is ${maxStock}`, 'info');
            }
        });
    }
}

async function handleAddToCart() {
    if (!currentProduct) return;

    if (!isAuthenticated()) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        showToast('Please login to add items to your cart', 'info');
        setTimeout(() => {
            window.location.href = `/pages/login.html?redirect=${returnUrl}`;
        }, 1200);
        return;
    }

    if (addToCartBtn) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'ADDING TO CART...';
    }

    try {
        await cartApi.addItem(currentProduct.id, currentQuantity);
        showToast(`Added ${currentQuantity}x "${currentProduct.name}" to cart!`, 'success');
        window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (err) {
        showToast(err.message || 'Failed to add item to cart', 'error');
    } finally {
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'ADD TO CART';
        }
    }
}

function showLoading() {
    if (loadingEl) loadingEl.style.display = 'flex';
    if (errorEl) errorEl.style.display = 'none';
    if (detailContainerEl) detailContainerEl.style.display = 'none';
}

function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
}

function showError(title, msg) {
    hideLoading();
    if (detailContainerEl) detailContainerEl.style.display = 'none';
    if (errorEl) {
        errorEl.style.display = 'flex';
        if (errorTitleEl) errorTitleEl.textContent = title;
        if (errorMsgEl) errorMsgEl.textContent = msg;
    }
}

document.addEventListener('DOMContentLoaded', initProductPage);
