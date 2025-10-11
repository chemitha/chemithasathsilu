   // contact-animations.js
      const trigger = document.getElementById('contactTrigger');
      const links = document.getElementById('contactLinks');
      const section = document.getElementById('contact');
      let opened = false;

      function openLinks() {
        opened = true;
        trigger.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
        trigger.style.display = 'none';
        links.classList.remove('pointer-events-none');
        links.classList.add('opacity-100', 'scale-100');
        // Fluid staggered reveal
        links.querySelectorAll('a').forEach((btn, i) => {
          btn.animate(
          [
            { transform: 'scale(0.8) translateY(30px)', opacity: 0 },
            { transform: 'scale(1.1) translateY(-8px)', opacity: 1 },
            { transform: 'scale(1) translateY(0)', opacity: 1 }
          ],
          { duration: 600 + i * 100, easing: 'cubic-bezier(0.25,1,0.5,1)', fill: 'forwards' }
          );
        });
        }, 300);
      }

      function closeLinks() {
        if (!opened) return;
        opened = false;
        links.classList.remove('opacity-100', 'scale-100');
        links.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
        trigger.style.display = 'inline-block';
        trigger.classList.remove('opacity-0', 'scale-95');
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        opened ? closeLinks() : openLinks();
      });

      // Close when clicking anywhere outside or halfway
      document.addEventListener('click', (e) => {
        if (!section.contains(e.target)) closeLinks();
      });

      document.addEventListener('scroll', () => closeLinks());