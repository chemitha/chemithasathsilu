// Simple dark/light mode detection
document.documentElement.classList.toggle(
  'dark',
  window.matchMedia('(prefers-color-scheme: dark)').matches
);
// update year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
//notification text update
const notificationText = document.getElementById('notification-text');
if (notificationText) {
  const hours = new Date().getHours();
    let greeting = "Hello!";
    if (hours < 12) {
        greeting = "Good morning!";
    } else if (hours < 18) {
        greeting = "Good afternoon!";
    } else {
        greeting = "Good evening!";
    }   
    notificationText.innerHTML = `${greeting} I'm showcasing my projects, blogs, and fun stuff — basically my side hustles — on this page. Hope you enjoy exploring, and have a great day! <hr size="1" color="#444">Type  <span style="background-color: rgba(255, 255, 255, 0.2); border-radius: 15%; padding: 0 5px 3.5px;">Levi</span> to enter Levi Mode!`;
}
const notification = document.querySelector('.notification');

if (notification) {
  let hideTimeout;
  let fadeTimeout;

  // Helper function to hide notification smoothly
  const hideNotification = () => {
    notification.style.opacity = '0';
    fadeTimeout = setTimeout(() => {
      notification.style.display = 'none';
    }, 1500); // matches CSS transition
  };

  // Auto-hide after 8s
  hideTimeout = setTimeout(hideNotification, 8000);

  // Pause hiding on hover
  notification.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    clearTimeout(fadeTimeout);
    notification.style.opacity = '1';
    notification.style.display = 'block';
  });

  // Resume hiding after hover out (3s delay)
  notification.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(hideNotification, 3000);
  });
}
