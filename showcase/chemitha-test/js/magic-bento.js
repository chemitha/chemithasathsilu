// Initialize skills grid with Magic Bento effect
    function initializeSkills() {
      const container = document.getElementById('magic-bento-skills');
      const glowColor = '65, 105, 225';

      skills.forEach((skill, index) => {
        const card = document.createElement('div');
        card.className = 'skill-item skill-card relative p-4 md:p-6 rounded-[2vh] bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-white/20 flex flex-col justify-center items-center';

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