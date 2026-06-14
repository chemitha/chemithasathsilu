// Simple dark/light mode detection (copied for labs)
document.documentElement.classList.toggle(
  'dark',
  window.matchMedia('(prefers-color-scheme: dark)').matches
);
// update year in footer
const yearSpanLab = document.getElementById('year');
if (yearSpanLab) {
  yearSpanLab.textContent = new Date().getFullYear();
}
//notification text update
const notificationTextLab = document.getElementById('notification-text');
if (notificationTextLab) {
  const hours = new Date().getHours();
    let greeting = "Hello!";
    if (hours < 12) {
        greeting = "Good morning!";
    } else if (hours < 18) {
        greeting = "Good afternoon!";
    } else {
        greeting = "Good evening!";
    }   
    notificationTextLab.innerHTML = `${greeting} I'm showcasing my projects, blogs, and fun stuff — basically my side hustles — on this page. Hope you enjoy exploring, and have a great day! <hr size="1" color="#444">Type  <span style="background-color: rgba(255, 255, 255, 0.2); border-radius: 15%; padding: 0 5px 3.5px;">Levi</span> to enter Levi Mode!`;
}
const notificationLab = document.querySelector('.notification');

if (notificationLab) {
  let hideTimeout;
  let fadeTimeout;

  // Helper function to hide notification smoothly
  const hideNotification = () => {
    notificationLab.style.opacity = '0';
    fadeTimeout = setTimeout(() => {
      notificationLab.style.display = 'none';
    }, 1500); // matches CSS transition
  };

  // Auto-hide after 8s
  hideTimeout = setTimeout(hideNotification, 8000);

  // Pause hiding on hover
  notificationLab.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    clearTimeout(fadeTimeout);
    notificationLab.style.opacity = '1';
    notificationLab.style.display = 'block';
  });

  // Resume hiding after hover out (3s delay)
  notificationLab.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(hideNotification, 3000);
  });
}
