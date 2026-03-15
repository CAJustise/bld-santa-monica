const drawers = document.querySelectorAll('.drawer');
const heroOverlay = document.querySelector('.hero-overlay');
const BOH_PASSWORD = 'bld-admin';

const openDrawer = (drawerId) => {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;

  drawers.forEach(d => {
    if (d !== drawer) {
      d.classList.remove('active');
    }
  });

  drawer.classList.toggle('active');

  if (drawer.classList.contains('active')) {
    heroOverlay.classList.add('slide-up');
  } else {
    heroOverlay.classList.remove('slide-up');
  }
};

const navLinks = document.querySelectorAll('.nav-link[data-drawer]');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const drawerId = link.getAttribute('data-drawer');
    openDrawer(drawerId);
  });
});

const feedbackForm = document.getElementById('feedback-form');
const formMessage = document.getElementById('form-message');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.style.display = 'block';
    feedbackForm.reset();
  });
}

const bohTrigger = document.getElementById('boh-trigger');
if (bohTrigger) {
  bohTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    const drawerId = bohTrigger.getAttribute('data-drawer');
    openDrawer(drawerId);
  });
}

const bohLoginForm = document.getElementById('boh-login-form');
const bohPasswordInput = document.getElementById('boh-password');
const bohLoginMessage = document.getElementById('boh-login-message');
const bohPanel = document.getElementById('boh-panel');
if (bohLoginForm && bohPasswordInput && bohLoginMessage && bohPanel) {
  bohLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submittedPassword = bohPasswordInput.value.trim();
    if (submittedPassword === BOH_PASSWORD) {
      bohPanel.style.display = 'block';
      bohLoginMessage.textContent = 'BOH unlocked.';
      bohLoginMessage.style.display = 'block';
      bohLoginMessage.style.color = 'green';
      bohLoginForm.reset();
      return;
    }
    bohPanel.style.display = 'none';
    bohLoginMessage.textContent = 'Incorrect password.';
    bohLoginMessage.style.display = 'block';
    bohLoginMessage.style.color = '#b00020';
  });
}

document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const drawer = btn.closest('.drawer');
    drawer.classList.remove('active');
    heroOverlay.classList.remove('slide-up');
  });
});

document.querySelectorAll('.drawer').forEach(drawer => {
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      drawer.classList.remove('active');
      heroOverlay.classList.remove('slide-up');
    }
  });
});

document.addEventListener('click', (e) => {
  if (
    !e.target.closest('.drawer') &&
    !e.target.closest('.nav-links .nav-link') &&
    !e.target.closest('.cta-button') &&
    !e.target.closest('.footer-admin-trigger')
  ) {
    drawers.forEach(drawer => {
      drawer.classList.remove('active');
    });
    heroOverlay.classList.remove('slide-up');
  }
});
