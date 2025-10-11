    // Skills data
    const skills = [
      { icon: '<i class="fas fa-rocket"></i>', title: 'Web Dev', desc: 'Full-stack apps' },
      { icon: '<i class="fas fa-robot"></i>', title: 'AI/ML', desc: 'Smart automation' },
      { icon: '<i class="fas fa-palette"></i>', title: 'UI/UX', desc: 'Modern design' },
      { icon: '<i class="fas fa-code"></i>', title: 'Frontend', desc: 'React & JS' },
      { icon: '<i class="fas fa-tools"></i>', title: 'Backend', desc: 'Python & APIs' },
      { icon: '<i class="fas fa-cloud"></i>', title: 'Cloud', desc: 'Deploy & scale' },
      { icon: '<i class="fas fa-flask"></i>', title: 'Research', desc: 'Innovation R&D' },
      { icon: '<i class="fas fa-cogs"></i>', title: 'DevOps', desc: 'CI/CD & automation' },
      { icon: '<i class="fas fa-film"></i>', title: 'Editing', desc: 'Video & image content' }
    ];


    // Mobile menu functionality (replaced)
    let isMenuOpen = false;
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const siteNav = document.querySelector('.site-nav');
    const menuItems = document.querySelector('.menu-items');
    const mobileOverlay = document.getElementById('mobileOverlay') || menuItems; // fallback to menuItems if no dedicated overlay
    const navLinksMobile = document.querySelectorAll('.nav-link-mobile');

    function applyMenuState(open) {
      isMenuOpen = !!open;
      if (hamburgerBtn) hamburgerBtn.classList.toggle('active', isMenuOpen);
      if (siteNav) siteNav.classList.toggle('menu-active', isMenuOpen);
      if (menuItems) menuItems.classList.toggle('active', isMenuOpen);
      if (mobileOverlay && mobileOverlay !== menuItems) mobileOverlay.classList.toggle('active', isMenuOpen);
      document.body.style.overflow = isMenuOpen ? 'hidden' : '';
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', String(isMenuOpen));
    }

    function toggleMobileMenu() {
      applyMenuState(!isMenuOpen);
    }

    function closeMobileMenu() {
      applyMenuState(false);
    }

    // Close menu when clicking on mobile nav links (with smooth scroll)
    if (navLinksMobile && navLinksMobile.length) {
      navLinksMobile.forEach(link => {
        link.addEventListener('click', (ev) => {
          closeMobileMenu();
          // Smooth scroll to target (if present)
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
              ev.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }

    // If there's an overlay element, close when clicking outside menu
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) closeMobileMenu();
      });
    }

    // Close menu on scroll
    window.addEventListener('scroll', () => {
      if (isMenuOpen) closeMobileMenu();
    });

    // Close menu on window resize if it becomes desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && isMenuOpen) closeMobileMenu();
    });

    // Initialize skills grid with Magic Bento effect
    function initializeSkills() {
      const container = document.getElementById('magic-bento-skills');
      const glowColor = '65, 105, 225';

      skills.forEach((skill, index) => {
        const card = document.createElement('div');
        card.className = 'skill-item skill-card relative p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-white/20 flex flex-col justify-center items-center';

        card.innerHTML = `
          <div class="flex flex-col items-center gap-2 md:gap-4 h-full justify-center">
            <div class="text-2xl md:text-3xl text-[#4169e1]">${skill.icon}</div>
            <div class="text-center">
              <div class="text-sm md:text-lg font-semibold mb-1 md:mb-2">${skill.title}</div>
              <div class="text-xs md:text-sm text-whitesmoke/70">${skill.desc}</div>
            </div>
          </div>
        `;

        container.appendChild(card);

        // Add glow effect
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--glow-x', `${x}%`);
          card.style.setProperty('--glow-y', `${y}%`);
          card.style.setProperty('--glow-intensity', '1');
        });

        card.addEventListener('mouseleave', () => {
          card.style.setProperty('--glow-intensity', '0');
        });
      });
    }

    // Navbar scroll effect
    function handleNavbarScroll() {
      const navbar = document.querySelector('.site-nav');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button
    function handleBackToTop() {
      const button = document.getElementById('backToTop');
      if (window.scrollY > 300) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }

    // Scroll reveal animation
    function handleScrollReveal() {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('is-visible');
        }
      });
    }

    // Active nav link
    function updateActiveNav() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');

      // Get the current scroll position with a slight offset
      const scrollY = window.pageYOffset + 100; // offset helps with highlighting

      // Find the current section
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100; // offset for earlier highlight trigger
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          // Remove active class from all links
          navLinks.forEach(link => link.classList.remove('active'));
          
          // Add active class to corresponding links
          document.querySelectorAll(`a[href="#${sectionId}"]`)
            .forEach(link => link.classList.add('active'));
        }
      });

      // Special case for top of page
      if (scrollY < 100) {
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelectorAll('a[href="#home"]')
          .forEach(link => link.classList.add('active'));
      }
    }

    // Make sure updateActiveNav runs on scroll and page load
    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('DOMContentLoaded', updateActiveNav);

    // Contact split button
    function initializeContactButton() {
      const contactBtn = document.getElementById('contactBtn');
      contactBtn.addEventListener('mouseenter', () => {
        contactBtn.classList.add('split');
      });
      contactBtn.addEventListener('mouseleave', () => {
        contactBtn.classList.remove('split');
      });
    }

    // Smooth scroll for navigation links
    function initializeSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();

          const target = document.querySelector(this.getAttribute('href'));
          if (!target) return;

          // Close mobile menu if open
          if (typeof closeMobileMenu === 'function') closeMobileMenu();

          // Calculate header offset
          const header = document.querySelector('.site-nav');
          const headerHeight = header ? header.offsetHeight : 80;

          // Calculate positions
          const startY = window.pageYOffset;
          const targetY = target.getBoundingClientRect().top + startY - headerHeight;

          // Animate scroll
          const duration = 800;
          const startTime = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeInOutQuart = t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;

            window.scrollTo(0, startY + (targetY - startY) * easeInOutQuart(progress));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Add reveal animation after scroll completes
              target.style.opacity = '0';
              target.style.transform = 'translateY(20px)';

              requestAnimationFrame(() => {
                target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
              });
            }
          }

          requestAnimationFrame(animate);
        });
      });
    }

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
      initializeSkills();
      initializeSmoothScroll(); // Initialize the smooth scroll
      updateActiveNav();
      // ... other initialization code ...
    });

    // Scroll event listeners
    window.addEventListener('scroll', () => {
      handleNavbarScroll();
      handleBackToTop();
      handleScrollReveal();
      updateActiveNav();
    });

    // Add CSS for skill card glow effect
    const style = document.createElement('style');
    style.textContent = `
      #magic-bento-skills > div::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--glow-x,50%) var(--glow-y,50%), rgba(65,105,225, calc(var(--glow-intensity,0) * 0.25)) 0%, transparent 60%);
        border-radius: inherit;
        pointer-events: none;
        transition: opacity 0.4s ease;
        opacity: var(--glow-intensity,0);
      }
      #magic-bento-skills > div:hover::before {
        opacity: 1 !important;
      }
      
      .skill-card {
        min-height: 140px;
      }
      
      @media (max-width: 768px) {
        .skill-card {
          min-height: 120px;
          padding: 1rem !important;
        }
      }
    `;
    document.head.appendChild(style);