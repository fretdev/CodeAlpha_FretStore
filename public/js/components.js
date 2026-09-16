import { authApi, cartApi, isAuthenticated, removeToken } from './api.js';

export async function initNavbar() {
    const navbarEl = document.getElementById('navbar');
    if (!navbarEl) return;

    try {
        const response = await fetch('/components/navbar.html');
        if (!response.ok) throw new Error('Failed to load navbar component');
        const html = await response.text();
        navbarEl.innerHTML = html;

        setupMobileDrawer(navbarEl);
        setupActiveNavLinks(navbarEl);
        setupSearch(navbarEl);
        await updateNavAuthState(navbarEl);
        await updateCartBadge();
    } catch (err) {
        console.error('Navbar initialization error:', err);
    }
}

export async function initFooter() {
    const footerEl = document.getElementById('footer');
    if (!footerEl) return;

    try {
        const response = await fetch('/components/footer.html');
        if (!response.ok) throw new Error('Failed to load footer component');
        const html = await response.text();
        footerEl.innerHTML = html;
    } catch (err) {
        console.error('Footer initialization error:', err);
    }
}

function setupMobileDrawer(navbar) {
    const menuToggle = navbar.querySelector('#mobile-menu-toggle');
    const drawer = navbar.querySelector('#mobile-drawer');
    const backdrop = navbar.querySelector('#drawer-backdrop');
    const closeBtn = navbar.querySelector('#drawer-close-btn');

    if (!menuToggle || !drawer || !backdrop) return;

    const openDrawer = () => {
        drawer.classList.add('is-open');
        backdrop.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.classList.add('drawer-open');
    };

    const closeDrawer = () => {
        drawer.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('drawer-open');
    };

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (drawer.classList.contains('is-open')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDrawer);
    }

    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
            closeDrawer();
        }
    });

    const links = drawer.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });
}

function setupActiveNavLinks(navbar) {
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category')?.toLowerCase() || (currentPath === '/' || currentPath.endsWith('index.html') ? 'all' : '');

    const allLinks = navbar.querySelectorAll('.nav-links a, .drawer-links a');
    allLinks.forEach(link => {
        const cat = link.dataset.category;
        if (cat && cat === currentCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupSearch(navbar) {
    const desktopSearch = navbar.querySelector('#nav-search-input');
    const desktopForm = navbar.querySelector('#nav-search-form');
    const drawerSearch = navbar.querySelector('#drawer-search-input');
    const drawerForm = navbar.querySelector('#drawer-search-form');

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('search') || '';
    if (initialQuery) {
        if (desktopSearch) desktopSearch.value = initialQuery;
        if (drawerSearch) drawerSearch.value = initialQuery;
    }

    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

    const handleSearchInput = (query) => {
        if (desktopSearch && desktopSearch.value !== query) desktopSearch.value = query;
        if (drawerSearch && drawerSearch.value !== query) drawerSearch.value = query;

        if (isHomePage) {
            window.dispatchEvent(new CustomEvent('search:query', { detail: { query } }));
        }
    };

    const handleSearchSubmit = (query) => {
        if (!isHomePage) {
            window.location.href = `/pages/index.html?search=${encodeURIComponent(query)}`;
        } else {
            window.dispatchEvent(new CustomEvent('search:query', { detail: { query } }));
        }
    };

    if (desktopSearch) {
        desktopSearch.addEventListener('input', (e) => handleSearchInput(e.target.value.trim()));
    }
    if (desktopForm) {
        desktopForm.addEventListener('submit', () => handleSearchSubmit(desktopSearch ? desktopSearch.value.trim() : ''));
    }

    if (drawerSearch) {
        drawerSearch.addEventListener('input', (e) => handleSearchInput(e.target.value.trim()));
    }
    if (drawerForm) {
        drawerForm.addEventListener('submit', () => {
            const query = drawerSearch ? drawerSearch.value.trim() : '';
            const drawer = navbar.querySelector('#mobile-drawer');
            const backdrop = navbar.querySelector('#drawer-backdrop');
            if (drawer) drawer.classList.remove('is-open');
            if (backdrop) backdrop.classList.remove('is-open');
            document.body.classList.remove('drawer-open');
            handleSearchSubmit(query);
        });
    }
}

export async function updateNavAuthState(navbar = document.getElementById('navbar')) {
    if (!navbar) return;
    const navBtns = navbar.querySelector('#nav-auth-btns');
    const drawerAuthBtns = navbar.querySelector('#drawer-auth-btns');

    if (!isAuthenticated()) {
        if (navBtns) {
            navBtns.innerHTML = `
                <a href="/pages/login.html" class="nav-btn login-btn">LOGIN</a>
                <a href="/pages/register.html" class="nav-btn register-btn">REGISTER</a>
            `;
        }
        if (drawerAuthBtns) {
            drawerAuthBtns.innerHTML = `
                <a href="/pages/login.html" class="btn btn-outline btn-block">LOGIN</a>
                <a href="/pages/register.html" class="btn btn-primary btn-block">CREATE ACCOUNT</a>
            `;
        }
        return;
    }

    try {
        const me = await authApi.getMe();
        const isAdmin = me.role === 'admin';

        let desktopBtnsHtml = '';
        let drawerBtnsHtml = '';

        if (isAdmin) {
            desktopBtnsHtml += `<a href="/pages/admin.html" class="nav-btn admin-btn">ADMIN</a>`;
            drawerBtnsHtml += `<a href="/pages/admin.html" class="btn btn-accent btn-block">ADMIN CONSOLE</a>`;
        }
        desktopBtnsHtml += `
            <a href="/pages/orders.html" class="nav-btn orders-btn">ORDERS</a>
            <button type="button" class="nav-btn logout-btn" id="logout-btn">LOGOUT</button>
        `;
        drawerBtnsHtml += `
            <a href="/pages/orders.html" class="btn btn-outline btn-block">MY ORDERS</a>
            <button type="button" class="btn btn-danger btn-block" id="drawer-logout-btn">LOG OUT</button>
        `;

        if (navBtns) navBtns.innerHTML = desktopBtnsHtml;
        if (drawerAuthBtns) drawerAuthBtns.innerHTML = drawerBtnsHtml;

        const logoutBtn = navbar.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authApi.logout();
                window.location.href = '/pages/login.html';
            });
        }

        const drawerLogoutBtn = navbar.querySelector('#drawer-logout-btn');
        if (drawerLogoutBtn) {
            drawerLogoutBtn.addEventListener('click', () => {
                authApi.logout();
                window.location.href = '/pages/login.html';
            });
        }
    } catch (err) {
        removeToken();
        if (navBtns) {
            navBtns.innerHTML = `
                <a href="/pages/login.html" class="nav-btn login-btn">LOGIN</a>
                <a href="/pages/register.html" class="nav-btn register-btn">REGISTER</a>
            `;
        }
        if (drawerAuthBtns) {
            drawerAuthBtns.innerHTML = `
                <a href="/pages/login.html" class="btn btn-outline btn-block">LOGIN</a>
                <a href="/pages/register.html" class="btn btn-primary btn-block">CREATE ACCOUNT</a>
            `;
        }
    }
}

export async function updateCartBadge() {
    const desktopBadge = document.getElementById('nav-cart-badge');
    const drawerBadge = document.getElementById('drawer-cart-badge');

    if (!isAuthenticated()) {
        if (desktopBadge) desktopBadge.style.display = 'none';
        if (drawerBadge) drawerBadge.style.display = 'none';
        return;
    }

    try {
        const cartItems = await cartApi.get();
        const count = Array.isArray(cartItems) 
            ? cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
            : 0;

        if (count > 0) {
            const text = count > 99 ? '99+' : count.toString();
            if (desktopBadge) {
                desktopBadge.textContent = text;
                desktopBadge.style.display = 'inline-flex';
            }
            if (drawerBadge) {
                drawerBadge.textContent = text;
                drawerBadge.style.display = 'inline-flex';
            }
        } else {
            if (desktopBadge) desktopBadge.style.display = 'none';
            if (drawerBadge) drawerBadge.style.display = 'none';
        }
    } catch (err) {
        if (desktopBadge) desktopBadge.style.display = 'none';
        if (drawerBadge) drawerBadge.style.display = 'none';
    }
}

window.addEventListener('auth:change', () => {
    updateNavAuthState();
    updateCartBadge();
});

window.addEventListener('auth:expired', () => {
    updateNavAuthState();
    updateCartBadge();
});

window.addEventListener('cart:updated', () => {
    updateCartBadge();
});

document.addEventListener('DOMContentLoaded', async () => {
    await initNavbar();
    await initFooter();
});