// script.js

// Get the drawers and hero overlay
const drawers = document.querySelectorAll('.drawer');
const heroOverlay = document.querySelector('.hero-overlay');

// Debug: Log to confirm the script is running
console.log('Script loaded');

// Debug: Log all click events
document.addEventListener('click', (e) => {
  console.log('Click event target:', e.target); // Debug: Log every click event
});

// Function to open a drawer
const openDrawer = (drawerId) => {
  const drawer = document.getElementById(drawerId);

  // Close all other drawers
  drawers.forEach(d => {
    if (d !== drawer) {
      d.classList.remove('active');
    }
  });

  // Toggle the clicked drawer
  drawer.classList.toggle('active');

  // Slide the hero content up when the drawer opens
  if (drawer.classList.contains('active')) {
    heroOverlay.classList.add('slide-up');
  } else {
    heroOverlay.classList.remove('slide-up');
  }
};

// Handle nav links with data-drawer attribute (this will handle both nav links and the hero button)
const navLinks = document.querySelectorAll('.nav-link[data-drawer]');
console.log('Nav Links with data-drawer:', navLinks); // Debug: Log the nav links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    console.log('Nav link clicked:', link); // Debug: Log the clicked link
    const drawerId = link.getAttribute('data-drawer');
    openDrawer(drawerId);
  });
});

// Handle feedback form submission
const feedbackForm = document.getElementById('feedback-form');
const formMessage = document.getElementById('form-message');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    const formData = new FormData(feedbackForm);
    const feedbackData = {
      name: formData.get('name'),
      email: formData.get('email'),
      feedback: formData.get('feedback')
    };
    console.log('Feedback submitted:', feedbackData); // Log the form data
    formMessage.style.display = 'block'; // Show the success message
    feedbackForm.reset(); // Reset the form
  });
}

// Close drawer when clicking the close button
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const drawer = btn.closest('.drawer');
    drawer.classList.remove('active');
    heroOverlay.classList.remove('slide-up');
  });
});

// Close drawer when clicking the drawer itself
document.querySelectorAll('.drawer').forEach(drawer => {
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      drawer.classList.remove('active');
      heroOverlay.classList.remove('slide-up');
    }
  });
});

// Close drawer when clicking outside (on the page)
document.addEventListener('click', (e) => {
  if (!e.target.closest('.drawer') && !e.target.closest('.nav-links .nav-link') && !e.target.closest('.cta-button')) {
    drawers.forEach(drawer => {
      drawer.classList.remove('active');
    });
    heroOverlay.classList.remove('slide-up');
  }
});