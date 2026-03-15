const STORAGE_KEY = 'bld-site-config-v1';

const defaultConfig = {
  promo: { active: false, text: '', ctaLabel: '', ctaUrl: '' },
  menuItems: [
    { id: crypto.randomUUID(), name: 'Breakfast', price: 20, image: 'images/breakfast.jpg' },
    { id: crypto.randomUUID(), name: 'Lunch', price: 25, image: 'images/lunch.jpg' },
    { id: crypto.randomUUID(), name: 'Dinner', price: 35, image: 'images/dinner.jpg' },
  ],
  merchItems: [
    { id: crypto.randomUUID(), name: 'BLD Tote', price: 25, image: 'images/bldlogo.png' },
  ],
  location: {
    address: '120 Santa Monica Blvd, Santa Monica, CA 90401',
    mapUrl: 'https://www.google.com/maps/place/120+Santa+Monica+Blvd,+Santa+Monica,+CA+90401',
    phone: '(424) 867-5309',
    email: 'info@bldsantamonica.com',
    breakfastHours: '5 AM - 10 AM',
    lunchHours: '10 AM - 3 PM',
    dinnerHours: '3 PM - 9 PM',
    openDays: 'Open 7 days a week',
  },
  socialLinks: [
    { id: crypto.randomUUID(), label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
  ],
};

const drawers = document.querySelectorAll('.drawer');
const heroOverlay = document.querySelector('.hero-overlay');
const navLinks = document.querySelectorAll('.nav-link[data-drawer]');
const bohTrigger = document.getElementById('boh-trigger');

const state = loadConfig();

initDrawers();
initFeedbackForm();
initBOHForms();
renderAll();

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultConfig);
    const parsed = JSON.parse(raw);
    return {
      promo: { ...defaultConfig.promo, ...(parsed.promo || {}) },
      menuItems: Array.isArray(parsed.menuItems) && parsed.menuItems.length ? parsed.menuItems : structuredClone(defaultConfig.menuItems),
      merchItems: Array.isArray(parsed.merchItems) ? parsed.merchItems : structuredClone(defaultConfig.merchItems),
      location: { ...defaultConfig.location, ...(parsed.location || {}) },
      socialLinks: Array.isArray(parsed.socialLinks) && parsed.socialLinks.length ? parsed.socialLinks : structuredClone(defaultConfig.socialLinks),
    };
  } catch {
    return structuredClone(defaultConfig);
  }
}

function saveConfig(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) {
    const status = document.getElementById('boh-status');
    if (status) status.textContent = message;
  }
}

function initDrawers() {
  const openDrawer = (drawerId) => {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;

    drawers.forEach((d) => {
      if (d !== drawer) d.classList.remove('active');
    });

    drawer.classList.toggle('active');
    if (drawer.classList.contains('active')) heroOverlay.classList.add('slide-up');
    else heroOverlay.classList.remove('slide-up');
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(link.getAttribute('data-drawer'));
    });
  });

  if (bohTrigger) {
    bohTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(bohTrigger.getAttribute('data-drawer'));
    });
  }

  document.querySelectorAll('.close-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const drawer = btn.closest('.drawer');
      if (drawer) drawer.classList.remove('active');
      heroOverlay.classList.remove('slide-up');
    });
  });

  drawers.forEach((drawer) => {
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
      drawers.forEach((drawer) => drawer.classList.remove('active'));
      heroOverlay.classList.remove('slide-up');
    }
  });
}

function initFeedbackForm() {
  const feedbackForm = document.getElementById('feedback-form');
  const formMessage = document.getElementById('form-message');
  if (!feedbackForm || !formMessage) return;

  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.style.display = 'block';
    feedbackForm.reset();
  });
}

function initBOHForms() {
  bindPromoForm();
  bindMenuForm();
  bindMerchForm();
  bindLocationForm();
  bindSocialForm();
}

function bindPromoForm() {
  const form = document.getElementById('promo-form');
  if (!form) return;

  document.getElementById('promo-active').checked = state.promo.active;
  document.getElementById('promo-text').value = state.promo.text;
  document.getElementById('promo-cta-label').value = state.promo.ctaLabel;
  document.getElementById('promo-cta-url').value = state.promo.ctaUrl;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.promo.active = document.getElementById('promo-active').checked;
    state.promo.text = document.getElementById('promo-text').value.trim();
    state.promo.ctaLabel = document.getElementById('promo-cta-label').value.trim();
    state.promo.ctaUrl = document.getElementById('promo-cta-url').value.trim();
    saveConfig('Promo saved.');
    renderPromo();
  });
}

function bindMenuForm() {
  const form = document.getElementById('menu-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('menu-name').value.trim();
    const price = Number(document.getElementById('menu-price').value);
    const image = document.getElementById('menu-image').value.trim() || 'images/breakfast.jpg';
    if (!name || Number.isNaN(price)) return;

    state.menuItems.push({ id: crypto.randomUUID(), name, price, image });
    saveConfig('Menu item added.');
    form.reset();
    renderMenus();
  });
}

function bindMerchForm() {
  const form = document.getElementById('merch-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('merch-name').value.trim();
    const price = Number(document.getElementById('merch-price').value);
    const image = document.getElementById('merch-image').value.trim() || 'images/bldlogo.png';
    if (!name || Number.isNaN(price)) return;

    state.merchItems.push({ id: crypto.randomUUID(), name, price, image });
    saveConfig('Merch item added.');
    form.reset();
    renderMerch();
  });
}

function bindLocationForm() {
  const form = document.getElementById('location-form');
  if (!form) return;

  document.getElementById('location-address').value = state.location.address;
  document.getElementById('location-map-url').value = state.location.mapUrl;
  document.getElementById('location-phone').value = state.location.phone;
  document.getElementById('location-email').value = state.location.email;
  document.getElementById('hours-breakfast-input').value = state.location.breakfastHours;
  document.getElementById('hours-lunch-input').value = state.location.lunchHours;
  document.getElementById('hours-dinner-input').value = state.location.dinnerHours;
  document.getElementById('hours-open-days-input').value = state.location.openDays;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.location.address = document.getElementById('location-address').value.trim();
    state.location.mapUrl = document.getElementById('location-map-url').value.trim();
    state.location.phone = document.getElementById('location-phone').value.trim();
    state.location.email = document.getElementById('location-email').value.trim();
    state.location.breakfastHours = document.getElementById('hours-breakfast-input').value.trim();
    state.location.lunchHours = document.getElementById('hours-lunch-input').value.trim();
    state.location.dinnerHours = document.getElementById('hours-dinner-input').value.trim();
    state.location.openDays = document.getElementById('hours-open-days-input').value.trim();

    saveConfig('Location details saved.');
    renderLocation();
  });
}

function bindSocialForm() {
  const form = document.getElementById('social-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = document.getElementById('social-label').value.trim();
    const icon = document.getElementById('social-icon').value;
    const url = document.getElementById('social-url').value.trim();
    if (!label || !url) return;

    state.socialLinks.push({ id: crypto.randomUUID(), label, icon, url });
    saveConfig('Social link added.');
    form.reset();
    renderSocialLinks();
  });
}

function removeMenuItem(id) {
  state.menuItems = state.menuItems.filter((item) => item.id !== id);
  saveConfig('Menu item removed.');
  renderMenus();
}

function removeMerchItem(id) {
  state.merchItems = state.merchItems.filter((item) => item.id !== id);
  saveConfig('Merch item removed.');
  renderMerch();
}

function removeSocialLink(id) {
  state.socialLinks = state.socialLinks.filter((item) => item.id !== id);
  saveConfig('Social link removed.');
  renderSocialLinks();
}

function renderAll() {
  renderPromo();
  renderMenus();
  renderMerch();
  renderLocation();
  renderSocialLinks();
}

function renderPromo() {
  const banner = document.getElementById('promo-banner');
  if (!banner) return;

  if (!state.promo.active || !state.promo.text) {
    banner.style.display = 'none';
    banner.innerHTML = '';
    return;
  }

  let ctaHtml = '';
  if (state.promo.ctaLabel && state.promo.ctaUrl) {
    ctaHtml = `<a href="${escapeHtml(state.promo.ctaUrl)}" target="_blank" rel="noopener">${escapeHtml(state.promo.ctaLabel)}</a>`;
  }
  banner.innerHTML = `<span>${escapeHtml(state.promo.text)}</span>${ctaHtml}`;
  banner.style.display = 'flex';
}

function renderMenus() {
  const menuContainer = document.getElementById('menu-meals');
  const menuAdminList = document.getElementById('menu-admin-list');
  if (!menuContainer || !menuAdminList) return;

  menuContainer.innerHTML = state.menuItems
    .map((item) => `
      <div class="meal-item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        <div class="meal-text">
          <h3>${escapeHtml(item.name)}</h3>
          <p>$${Number(item.price).toFixed(2)} per person</p>
        </div>
      </div>
    `)
    .join('');

  menuAdminList.innerHTML = state.menuItems
    .map((item) => `
      <div class="boh-list-row">
        <span>${escapeHtml(item.name)} - $${Number(item.price).toFixed(2)}</span>
        <button type="button" data-remove-menu="${item.id}">Remove</button>
      </div>
    `)
    .join('');

  menuAdminList.querySelectorAll('[data-remove-menu]').forEach((btn) => {
    btn.addEventListener('click', () => removeMenuItem(btn.getAttribute('data-remove-menu')));
  });
}

function renderMerch() {
  const merchContainer = document.getElementById('merch-grid');
  const merchAdminList = document.getElementById('merch-admin-list');
  if (!merchContainer || !merchAdminList) return;

  if (!state.merchItems.length) {
    merchContainer.innerHTML = '<p>No merch listed yet.</p>';
  } else {
    merchContainer.innerHTML = state.merchItems
      .map((item) => `
        <article class="merch-item">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
          <h4>${escapeHtml(item.name)}</h4>
          <p>$${Number(item.price).toFixed(2)}</p>
        </article>
      `)
      .join('');
  }

  merchAdminList.innerHTML = state.merchItems
    .map((item) => `
      <div class="boh-list-row">
        <span>${escapeHtml(item.name)} - $${Number(item.price).toFixed(2)}</span>
        <button type="button" data-remove-merch="${item.id}">Remove</button>
      </div>
    `)
    .join('');

  merchAdminList.querySelectorAll('[data-remove-merch]').forEach((btn) => {
    btn.addEventListener('click', () => removeMerchItem(btn.getAttribute('data-remove-merch')));
  });
}

function renderLocation() {
  const addressShort = state.location.address.split(',')[0] || state.location.address;

  setText('header-address', `📍 ${addressShort}`);
  setAttr('header-address', 'href', state.location.mapUrl);

  setText('hours-breakfast', `Breakfast: ${state.location.breakfastHours}`);
  setText('hours-lunch', `Lunch: ${state.location.lunchHours}`);
  setText('hours-dinner', `Dinner: ${state.location.dinnerHours}`);
  setText('hours-open-days', state.location.openDays);

  setText('location-link', state.location.address.replace(', ', '<br>'), true);
  setAttr('location-link', 'href', state.location.mapUrl);

  setText('contact-address-link', state.location.address.replace(', ', '<br>'), true);
  setAttr('contact-address-link', 'href', state.location.mapUrl);

  setText('phone-link', `Tel: ${state.location.phone}`);
  setAttr('phone-link', 'href', `tel:${sanitizePhone(state.location.phone)}`);

  setText('contact-phone-link', state.location.phone);
  setAttr('contact-phone-link', 'href', `tel:${sanitizePhone(state.location.phone)}`);

  setText('contact-email-link', state.location.email);
  setAttr('contact-email-link', 'href', `mailto:${state.location.email}`);
}

function renderSocialLinks() {
  const navTarget = document.getElementById('nav-social-links');
  const contactTarget = document.getElementById('contact-social-links');
  const shareTarget = document.getElementById('share-social-links');
  const adminList = document.getElementById('social-admin-list');

  const linksHtml = state.socialLinks
    .map((item) => {
      const icon = socialIconSvg(item.icon);
      return `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="social-chip" aria-label="${escapeHtml(item.label)}">${icon}<span>${escapeHtml(item.label)}</span></a>`;
    })
    .join('');

  if (navTarget) navTarget.innerHTML = state.socialLinks.map((item) => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="social-icon">${socialIconSvg(item.icon)}</a>`).join('');
  if (contactTarget) contactTarget.innerHTML = linksHtml || '<p>No social links yet.</p>';
  if (shareTarget) shareTarget.innerHTML = linksHtml || '<p>No social links yet.</p>';

  if (adminList) {
    adminList.innerHTML = state.socialLinks
      .map((item) => `
        <div class="boh-list-row">
          <span>${escapeHtml(item.label)} - ${escapeHtml(item.url)}</span>
          <button type="button" data-remove-social="${item.id}">Remove</button>
        </div>
      `)
      .join('');

    adminList.querySelectorAll('[data-remove-social]').forEach((btn) => {
      btn.addEventListener('click', () => removeSocialLink(btn.getAttribute('data-remove-social')));
    });
  }
}

function socialIconSvg(icon) {
  const base = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">';
  const map = {
    instagram: `${base}<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    facebook: `${base}<path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.6.4-1 1-1z" fill="currentColor"/></svg>`,
    tiktok: `${base}<path d="M14 5c.7 1.4 1.8 2.4 3.4 2.7V11c-1.3-.1-2.4-.5-3.4-1.2v5.1A4.9 4.9 0 1 1 9 10v2.7a2.3 2.3 0 1 0 2.3 2.3V5h2.7z" fill="currentColor"/></svg>`,
    x: `${base}<path d="M4 4h4.2l3.6 5.2L16 4h4l-6.2 7.2L20 20h-4.2l-3.9-5.6L7 20H3l6.5-7.5L4 4z" fill="currentColor"/></svg>`,
    youtube: `${base}<rect x="3" y="6" width="18" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>`,
    linkedin: `${base}<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/><path d="M7 12v5M11 17v-3c0-1.1.9-2 2-2s2 .9 2 2v3M11 12v5" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    link: `${base}<path d="M10 14l4-4M8.5 8.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 15.5l2-2a3 3 0 1 0-4.2-4.2l-2 2" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  };
  return map[icon] || map.link;
}

function setText(id, value, asHtml = false) {
  const node = document.getElementById(id);
  if (!node) return;
  if (asHtml) node.innerHTML = value;
  else node.textContent = value;
}

function setAttr(id, attr, value) {
  const node = document.getElementById(id);
  if (!node) return;
  node.setAttribute(attr, value);
}

function sanitizePhone(phone) {
  return phone.replace(/[^\d+]/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
