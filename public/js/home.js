import { productsApi, categoriesApi, formatPrice, escapeHtml } from './api.js';

let allProducts = [];
let allCategories = [];
let activeCategoryFilter = 'all';
let searchQuery = '';

const gridEl = document.getElementById('products-grid');
const loadingEl = document.getElementById('products-loading');
const errorEl = document.getElementById('products-error');
const errorMsgEl = document.getElementById('products-error-msg');
const emptyEl = document.getElementById('products-empty');
const countEl = document.getElementById('product-count');
const headingEl = document.getElementById('catalog-heading');
const filterBarEl = document.getElementById('category-filter-bar');

async function initHomePage() {
    const urlParams = new URLSearchParams(window.location.search);
    activeCategoryFilter = urlParams.get('category')?.toLowerCase() || 'all';
    searchQuery = urlParams.get('search')?.toLowerCase().trim() || '';

    setupEventListeners();
    await Promise.all([loadCategories(), loadProducts()]);
}

async function loadCategories() {
    try {
        const categories = await categoriesApi.getAll();
        allCategories = Array.isArray(categories) ? categories : [];
        renderCategoryFilters();
    } catch (err) {
        console.warn('Could not load dynamic categories:', err.message);
    }
}

function renderCategoryFilters() {
    if (!filterBarEl) return;

    let html = `<button type="button" class="filter-pill ${activeCategoryFilter === 'all' ? 'active' : ''}" data-category="all">ALL INSTRUMENTS</button>`;
    
    allCategories.forEach(cat => {
        const catKey = cat.name.toLowerCase();
        const isActive = activeCategoryFilter === catKey || 
                         (activeCategoryFilter === 'guitars' && catKey.includes('guitar')) ||
                         (activeCategoryFilter === 'accessories' && catKey.includes('accessor')) ||
                         (activeCategoryFilter === 'amplifiers' && catKey.includes('amplif'));

        html += `<button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-category="${escapeHtml(catKey)}">${escapeHtml(cat.name.toUpperCase())}</button>`;
    });

    filterBarEl.innerHTML = html;

    filterBarEl.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedCat = btn.dataset.category;
            setCategoryFilter(selectedCat);
        });
    });
}

async function loadProducts() {
    showLoading();
    try {
        const products = await productsApi.getAll();
        allProducts = Array.isArray(products) ? products : [];
        hideLoading();
        applyFiltersAndRender();
    } catch (err) {
        showError(err.message || 'Unable to connect to the store catalog.');
    }
}

function setCategoryFilter(categoryKey) {
    activeCategoryFilter = categoryKey.toLowerCase();
    
    if (filterBarEl) {
        filterBarEl.querySelectorAll('.filter-pill').forEach(btn => {
            const cat = btn.dataset.category.toLowerCase();
            const isActive = cat === activeCategoryFilter || 
                             (activeCategoryFilter === 'guitars' && cat.includes('guitar')) ||
                             (activeCategoryFilter === 'accessories' && cat.includes('accessor')) ||
                             (activeCategoryFilter === 'amplifiers' && cat.includes('amplif'));
            btn.classList.toggle('active', isActive);
        });
    }

    const url = new URL(window.location.href);
    if (activeCategoryFilter === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', activeCategoryFilter);
    }
    window.history.pushState({}, '', url);

    applyFiltersAndRender();
}

function applyFiltersAndRender() {
    if (!allProducts.length && !loadingEl.style.display.includes('flex')) {
        showEmpty();
        return;
    }

    const filtered = allProducts.filter(product => {
        const prodCat = (product.category || '').toLowerCase();
        let matchesCategory = false;

        if (activeCategoryFilter === 'all') {
            matchesCategory = true;
        } else if (activeCategoryFilter === 'guitars') {
            matchesCategory = prodCat.includes('guitar');
        } else if (activeCategoryFilter === 'accessories') {
            matchesCategory = prodCat.includes('accessor');
        } else if (activeCategoryFilter === 'amplifiers') {
            matchesCategory = prodCat.includes('amplif');
        } else {
            matchesCategory = prodCat === activeCategoryFilter || prodCat.includes(activeCategoryFilter);
        }

        let matchesSearch = true;
        if (searchQuery) {
            const name = (product.name || '').toLowerCase();
            const brand = (product.brand || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();
            const cat = (product.category || '').toLowerCase();
            matchesSearch = name.includes(searchQuery) || 
                            brand.includes(searchQuery) || 
                            desc.includes(searchQuery) ||
                            cat.includes(searchQuery);
        }

        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

function renderProducts(products) {
    if (!gridEl) return;

    if (products.length === 0) {
        gridEl.innerHTML = '';
        showEmpty();
        if (countEl) countEl.textContent = '0 instruments found';
        return;
    }

    hideEmpty();
    hideError();

    if (countEl) {
        countEl.textContent = `Showing ${products.length} of ${allProducts.length} instruments`;
    }
    if (headingEl) {
        if (searchQuery) {
            headingEl.textContent = `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"`;
        } else if (activeCategoryFilter !== 'all') {
            headingEl.textContent = `${activeCategoryFilter.toUpperCase()}`;
        } else {
            headingEl.textContent = 'ALL INSTRUMENTS';
        }
    }

    gridEl.innerHTML = products.map((product, index) => {
        const isOutOfStock = Number(product.stock_quantity) <= 0;
        const stockBadge = isOutOfStock
            ? `<span class="badge badge-danger">Out of Stock</span>`
            : Number(product.stock_quantity) <= 3
                ? `<span class="badge badge-gold">Only ${product.stock_quantity} left</span>`
                : `<span class="badge badge-green">In Stock</span>`;

        const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23181818'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23706C64'%3EInstrument Image%3C/text%3E%3C/svg%3E";

        const isAboveFold = index < 4;

        return `
            <article class="product-card">
                <a href="/pages/product.html?id=${product.id}" class="product-image-link" aria-label="View ${escapeHtml(product.name)}">
                    <img 
                        src="${escapeHtml(product.image_url || fallbackImg)}" 
                        alt="${escapeHtml(product.name)}" 
                        class="product-card-img"
                        ${isAboveFold ? 'fetchpriority="high"' : 'loading="lazy"'}
                        decoding="async"
                        onerror="this.onerror=null;this.src='${fallbackImg}';"
                    />
                </a>
                <div class="product-card-body">
                    <div class="product-card-meta">
                        <span class="product-brand">${escapeHtml(product.brand || 'Fret Store')}</span>
                        ${stockBadge}
                    </div>
                    <h3 class="product-card-title">
                        <a href="/pages/product.html?id=${product.id}">${escapeHtml(product.name)}</a>
                    </h3>
                    <p class="product-card-desc">${escapeHtml(product.description || 'Premium quality instrument from our collection.')}</p>
                    <div class="product-card-footer">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        <a href="/pages/product.html?id=${product.id}" class="btn btn-outline btn-sm">VIEW DETAILS</a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function showLoading() {
    if (loadingEl) loadingEl.style.display = 'flex';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) gridEl.innerHTML = '';
}

function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
}

function showError(msg) {
    hideLoading();
    if (errorEl) {
        errorEl.style.display = 'flex';
        if (errorMsgEl) errorMsgEl.textContent = msg;
    }
    if (gridEl) gridEl.innerHTML = '';
}

function hideError() {
    if (errorEl) errorEl.style.display = 'none';
}

function showEmpty() {
    if (emptyEl) emptyEl.style.display = 'flex';
}

function hideEmpty() {
    if (emptyEl) emptyEl.style.display = 'none';
}

function setupEventListeners() {
    window.addEventListener('search:query', (e) => {
        searchQuery = (e.detail?.query || '').toLowerCase().trim();
        applyFiltersAndRender();
    });

    const shopGuitarsBtn = document.getElementById('hero-shop-guitars-btn');
    if (shopGuitarsBtn) {
        shopGuitarsBtn.addEventListener('click', () => {
            setCategoryFilter('guitars');
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const shopAllBtn = document.getElementById('hero-shop-all-btn');
    if (shopAllBtn) {
        shopAllBtn.addEventListener('click', () => {
            setCategoryFilter('all');
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const retryBtn = document.getElementById('retry-products-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', loadProducts);
    }

    const resetBtn = document.getElementById('reset-filter-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            searchQuery = '';
            const searchInput = document.getElementById('nav-search-input');
            if (searchInput) searchInput.value = '';
            setCategoryFilter('all');
        });
    }

    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        activeCategoryFilter = urlParams.get('category')?.toLowerCase() || 'all';
        searchQuery = urlParams.get('search')?.toLowerCase().trim() || '';
        applyFiltersAndRender();
    });
}

document.addEventListener('DOMContentLoaded', initHomePage);
