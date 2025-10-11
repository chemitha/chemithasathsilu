// mobile-menu.js
(function () {
    const hamburger = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('mobileOverlay');
    const nav = document.querySelector('.site-nav');
    const brand = document.querySelector('.nav-brand');
    const links = document.querySelectorAll('.nav-link-mobile');
    let menuOpen = false;

    function openMenu() {
    menuOpen = true;
    hamburger.classList.add('active');
    overlay.classList.add('active');
    nav.classList.add('menu-active');
    brand.classList.add('opacity-0');
    document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
    menuOpen = false;
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
    nav.classList.remove('menu-active');
    brand.classList.remove('opacity-0');
    document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    menuOpen ? closeMenu() : openMenu();
    });

    if (overlay) {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMenu();
    });
    }

    // Close when clicking a link
    links.forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
    });

    // Close when scrolling or resizing to desktop
    window.addEventListener('scroll', () => menuOpen && closeMenu());
    window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && menuOpen) closeMenu();
    });
})();