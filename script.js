const STORAGE_KEY = 'bld-site-config-v1';
const SYNC_SETTINGS_KEY = 'bld-sync-settings-v1';

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

const defaultSyncSettings = {
  owner: 'CAJustise',
  repo: 'bld-santa-monica',
  branch: 'main',
  path: 'site-data.json',
  token: '',
};

const drawers = document.querySelectorAll('.drawer');
const heroOverlay = document.querySelector('.hero-overlay');
const navLinks = document.querySelectorAll('.nav-link[data-drawer]');
const bohTrigger = document.getElementById('boh-trigger');

let state = structuredClone(defaultConfig);
let syncSettings = loadSyncSettings();

boot();

async function boot() {
  state = loadConfigFromLocal();

  initDrawers();
  initFeedbackForm();
  initBOHForms();
  bindSyncForm();
  renderAll();

  try {
    const remoteConfig = await fetchPublishedConfig();
    if (remoteConfig) {
      state = mergeConfig(remoteConfig);
      saveConfigLocal();
      populateBOHFormValues();
      renderAll();
      setStatus('Loaded shared settings from GitHub.');
    }
  } catch {
    setStatus('Using local settings on this device.');
  }
}

function mergeConfig(input) {
  return {
    promo: { ...defaultConfig.promo, ...(input.promo || {}) },
    menuItems: normalizeItems(input.menuItems, defaultConfig.menuItems),
    merchItems: normalizeItems(input.merchItems, defaultConfig.merchItems),
    location: { ...defaultConfig.location, ...(input.location || {}) },
    socialLinks: normalizeItems(input.socialLinks, defaultConfig.socialLinks),
  };
}

function normalizeItems(items, fallback) {
  if (!Array.isArray(items) || !items.length) return structuredClone(fallback);
  return items.map((item) => ({ ...item, id: item.id || crypto.randomUUID() }));
}

function loadConfigFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultConfig);
    const parsed = JSON.parse(raw);
    return mergeConfig(parsed);
  } catch {
    return structuredClone(defaultConfig);
  }
}

function saveConfigLocal(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) setStatus(message);
}

function loadSyncSettings() {
  try {
    const raw = localStorage.getItem(SYNC_SETTINGS_KEY);
    if (!raw) return structuredClone(defaultSyncSettings);
    return { ...defaultSyncSettings, ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultSyncSettings);
  }
}

function saveSyncSettings(message) {
  localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(syncSettings));
  if (message) setStatus(message);
}

function setStatus(message) {
  const status = document.getElementById('boh-status');
  if (status) status.textContent = message;
}

async function fetchPublishedConfig() {
  const response = await fetch(`./${syncSettings.path}?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
}

function initDrawers() {
  const setHeroSlide = (isOpen) => {
    if (!heroOverlay) return;
    if (isOpen) heroOverlay.classList.add('slide-up');
    else heroOverlay.classList.remove('slide-up');
  };

  const openDrawer = (drawerId) => {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;

    drawers.forEach((d) => {
      if (d !== drawer) d.classList.remove('active');
    });

    drawer.classList.toggle('active');
    setHeroSlide(drawer.classList.contains('active'));
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
      setHeroSlide(false);
    });
  });

  drawers.forEach((drawer) => {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('active');
        setHeroSlide(false);
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
      setHeroSlide(false);
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

function populateBOHFormValues() {
  const promoActive = document.getElementById('promo-active');
  const promoText = document.getElementById('promo-text');
  const promoCtaLabel = document.getElementById('promo-cta-label');
  const promoCtaUrl = document.getElementById('promo-cta-url');

  if (promoActive) promoActive.checked = state.promo.active;
  if (promoText) promoText.value = state.promo.text;
  if (promoCtaLabel) promoCtaLabel.value = state.promo.ctaLabel;
  if (promoCtaUrl) promoCtaUrl.value = state.promo.ctaUrl;

  setFormValue('location-address', state.location.address);
  setFormValue('location-map-url', state.location.mapUrl);
  setFormValue('location-phone', state.location.phone);
  setFormValue('location-email', state.location.email);
  setFormValue('hours-breakfast-input', state.location.breakfastHours);
  setFormValue('hours-lunch-input', state.location.lunchHours);
  setFormValue('hours-dinner-input', state.location.dinnerHours);
  setFormValue('hours-open-days-input', state.location.openDays);
}

function setFormValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value;
}

function bindPromoForm() {
  const form = document.getElementById('promo-form');
  if (!form) return;
  populateBOHFormValues();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.promo.active = document.getElementById('promo-active').checked;
    state.promo.text = document.getElementById('promo-text').value.trim();
    state.promo.ctaLabel = document.getElementById('promo-cta-label').value.trim();
    state.promo.ctaUrl = document.getElementById('promo-cta-url').value.trim();
    saveConfigLocal('Promo saved locally.');
    renderPromo();
  });
}

function bindMenuForm() {
  const form = document.getElementById('menu-form');
  const uploadBtn = document.getElementById('menu-image-upload-btn');
  const fileInput = document.getElementById('menu-image-file');
  const imageInput = document.getElementById('menu-image');
  if (!form) return;

  if (uploadBtn && fileInput && imageInput) {
    uploadBtn.addEventListener('click', async () => {
      try {
        const uploadedPath = await uploadImageFromInput(fileInput, 'menu');
        imageInput.value = uploadedPath;
        setStatus(`Uploaded image to ${uploadedPath}`);
      } catch (err) {
        setStatus(`Menu image upload failed: ${err.message}`);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('menu-name').value.trim();
    const price = Number(document.getElementById('menu-price').value);
    const image = document.getElementById('menu-image').value.trim() || 'images/breakfast.jpg';
    if (!name || Number.isNaN(price)) return;
    if (price < 0 || price > 999.99) {
      setStatus('Menu price must be between 0.00 and 999.99.');
      return;
    }

    state.menuItems.push({ id: crypto.randomUUID(), name, price, image });
    saveConfigLocal('Menu item saved locally.');
    form.reset();
    renderMenus();
  });
}

function bindMerchForm() {
  const form = document.getElementById('merch-form');
  const uploadBtn = document.getElementById('merch-image-upload-btn');
  const fileInput = document.getElementById('merch-image-file');
  const imageInput = document.getElementById('merch-image');
  if (!form) return;

  if (uploadBtn && fileInput && imageInput) {
    uploadBtn.addEventListener('click', async () => {
      try {
        const uploadedPath = await uploadImageFromInput(fileInput, 'merch');
        imageInput.value = uploadedPath;
        setStatus(`Uploaded image to ${uploadedPath}`);
      } catch (err) {
        setStatus(`Merch image upload failed: ${err.message}`);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('merch-name').value.trim();
    const price = Number(document.getElementById('merch-price').value);
    const image = document.getElementById('merch-image').value.trim() || 'images/bldlogo.png';
    if (!name || Number.isNaN(price)) return;
    if (price < 0 || price > 999.99) {
      setStatus('Merch price must be between 0.00 and 999.99.');
      return;
    }

    state.merchItems.push({ id: crypto.randomUUID(), name, price, image });
    saveConfigLocal('Merch item saved locally.');
    form.reset();
    renderMerch();
  });
}

function bindLocationForm() {
  const form = document.getElementById('location-form');
  if (!form) return;
  populateBOHFormValues();

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

    saveConfigLocal('Location saved locally.');
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
    saveConfigLocal('Social link saved locally.');
    form.reset();
    renderSocialLinks();
  });
}

function bindSyncForm() {
  setFormValue('sync-owner', syncSettings.owner);
  setFormValue('sync-repo', syncSettings.repo);
  setFormValue('sync-branch', syncSettings.branch);
  setFormValue('sync-path', syncSettings.path);
  setFormValue('sync-token', syncSettings.token);

  const form = document.getElementById('sync-form');
  const pullBtn = document.getElementById('sync-pull-btn');
  const pushBtn = document.getElementById('sync-push-btn');
  if (!form || !pullBtn || !pushBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    syncSettings.owner = document.getElementById('sync-owner').value.trim();
    syncSettings.repo = document.getElementById('sync-repo').value.trim();
    syncSettings.branch = document.getElementById('sync-branch').value.trim();
    syncSettings.path = document.getElementById('sync-path').value.trim();
    syncSettings.token = document.getElementById('sync-token').value.trim();
    saveSyncSettings('Sync settings saved on this device.');
  });

  pullBtn.addEventListener('click', async () => {
    try {
      setStatus('Loading config from GitHub...');
      const data = await pullConfigFromGitHub();
      state = mergeConfig(data);
      saveConfigLocal();
      populateBOHFormValues();
      renderAll();
      setStatus('Loaded latest config from GitHub.');
    } catch (err) {
      setStatus(`GitHub load failed: ${err.message}`);
    }
  });

  pushBtn.addEventListener('click', async () => {
    try {
      setStatus('Saving config to GitHub...');
      await pushConfigToGitHub();
      setStatus('Saved to GitHub. All devices can now load shared data.');
    } catch (err) {
      setStatus(`GitHub save failed: ${err.message}`);
    }
  });
}

async function pullConfigFromGitHub() {
  const url = `https://api.github.com/repos/${encodeURIComponent(syncSettings.owner)}/${encodeURIComponent(syncSettings.repo)}/contents/${encodeGitHubPath(syncSettings.path)}?ref=${encodeURIComponent(syncSettings.branch)}`;
  const response = await fetch(url, {
    headers: githubHeaders(syncSettings.token),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  const decoded = decodeBase64(payload.content || '');
  return JSON.parse(decoded);
}

async function pushConfigToGitHub() {
  if (!syncSettings.token) {
    throw new Error('Enter a GitHub token first.');
  }

  await putRepoFile({
    path: syncSettings.path,
    message: 'Update BLD site data from BOH panel',
    contentBase64: encodeBase64(JSON.stringify(state, null, 2)),
  });
}

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function removeMenuItem(id) {
  state.menuItems = state.menuItems.filter((item) => item.id !== id);
  saveConfigLocal('Menu item removed locally.');
  renderMenus();
}

function updateMenuItem(id, nextValues) {
  state.menuItems = state.menuItems.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      name: nextValues.name,
      price: nextValues.price,
      image: nextValues.image,
    };
  });
  saveConfigLocal('Menu item updated locally.');
  renderMenus();
}

function removeMerchItem(id) {
  state.merchItems = state.merchItems.filter((item) => item.id !== id);
  saveConfigLocal('Merch item removed locally.');
  renderMerch();
}

function updateMerchItem(id, nextValues) {
  state.merchItems = state.merchItems.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      name: nextValues.name,
      price: nextValues.price,
      image: nextValues.image,
    };
  });
  saveConfigLocal('Merch item updated locally.');
  renderMerch();
}

function removeSocialLink(id) {
  state.socialLinks = state.socialLinks.filter((item) => item.id !== id);
  saveConfigLocal('Social link removed locally.');
  renderSocialLinks();
}

function updateSocialLink(id, nextValues) {
  state.socialLinks = state.socialLinks.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      label: nextValues.label,
      icon: nextValues.icon,
      url: nextValues.url,
    };
  });
  saveConfigLocal('Social link updated locally.');
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
  banner.style.display = 'inline-flex';
}

function renderMenus() {
  const menuContainer = document.getElementById('menu-meals');
  const menuAdminList = document.getElementById('menu-admin-list');
  if (menuContainer) {
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
  }

  if (!menuAdminList) return;

  menuAdminList.innerHTML = state.menuItems
    .map((item) => `
      <div class="boh-list-row">
        <div class="boh-row-fields">
          <input class="name-field" type="text" value="${escapeHtml(item.name)}" data-menu-name="${item.id}" aria-label="Menu item name">
          <input class="price-field" type="number" min="0" max="999.99" step="0.01" value="${Number(item.price).toFixed(2)}" data-menu-price="${item.id}" aria-label="Menu item price">
          <input type="text" value="${escapeHtml(item.image)}" data-menu-image="${item.id}" aria-label="Menu item image">
        </div>
        <div class="boh-row-actions">
          <button type="button" class="boh-action-save" data-update-menu="${item.id}">Save</button>
          <button type="button" class="boh-action-remove" data-remove-menu="${item.id}">Remove</button>
        </div>
      </div>
    `)
    .join('');

  menuAdminList.querySelectorAll('[data-update-menu]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-update-menu');
      const name = menuAdminList.querySelector(`[data-menu-name="${id}"]`)?.value.trim() || '';
      const price = Number(menuAdminList.querySelector(`[data-menu-price="${id}"]`)?.value);
      const image = menuAdminList.querySelector(`[data-menu-image="${id}"]`)?.value.trim() || 'images/breakfast.jpg';
      if (!name || Number.isNaN(price)) {
        setStatus('Menu update needs a valid name and price.');
        return;
      }
      if (price < 0 || price > 999.99) {
        setStatus('Menu price must be between 0.00 and 999.99.');
        return;
      }
      updateMenuItem(id, { name, price, image });
    });
  });

  menuAdminList.querySelectorAll('[data-remove-menu]').forEach((btn) => {
    btn.addEventListener('click', () => removeMenuItem(btn.getAttribute('data-remove-menu')));
  });
}

function renderMerch() {
  const merchContainer = document.getElementById('merch-grid');
  const merchAdminList = document.getElementById('merch-admin-list');
  if (merchContainer) {
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
  }

  if (!merchAdminList) return;

  merchAdminList.innerHTML = state.merchItems
    .map((item) => `
      <div class="boh-list-row">
        <div class="boh-row-fields">
          <input class="name-field" type="text" value="${escapeHtml(item.name)}" data-merch-name="${item.id}" aria-label="Merch item name">
          <input class="price-field" type="number" min="0" max="999.99" step="0.01" value="${Number(item.price).toFixed(2)}" data-merch-price="${item.id}" aria-label="Merch item price">
          <input type="text" value="${escapeHtml(item.image)}" data-merch-image="${item.id}" aria-label="Merch item image">
        </div>
        <div class="boh-row-actions">
          <button type="button" class="boh-action-save" data-update-merch="${item.id}">Save</button>
          <button type="button" class="boh-action-remove" data-remove-merch="${item.id}">Remove</button>
        </div>
      </div>
    `)
    .join('');

  merchAdminList.querySelectorAll('[data-update-merch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-update-merch');
      const name = merchAdminList.querySelector(`[data-merch-name="${id}"]`)?.value.trim() || '';
      const price = Number(merchAdminList.querySelector(`[data-merch-price="${id}"]`)?.value);
      const image = merchAdminList.querySelector(`[data-merch-image="${id}"]`)?.value.trim() || 'images/bldlogo.png';
      if (!name || Number.isNaN(price)) {
        setStatus('Merch update needs a valid name and price.');
        return;
      }
      if (price < 0 || price > 999.99) {
        setStatus('Merch price must be between 0.00 and 999.99.');
        return;
      }
      updateMerchItem(id, { name, price, image });
    });
  });

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

  if (navTarget) {
    navTarget.innerHTML = state.socialLinks
      .map((item) => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="social-icon" aria-label="${escapeHtml(item.label)}">${socialIconSvg(item.icon)}</a>`)
      .join('');
  }

  if (contactTarget) contactTarget.innerHTML = linksHtml || '<p>No social links yet.</p>';
  if (shareTarget) shareTarget.innerHTML = linksHtml || '<p>No social links yet.</p>';

  if (!adminList) return;

  adminList.innerHTML = state.socialLinks
      .map((item) => `
        <div class="boh-list-row">
          <div class="boh-row-fields">
            <input type="text" value="${escapeHtml(item.label)}" data-social-label="${item.id}" aria-label="Social label">
            <select data-social-icon="${item.id}" aria-label="Social icon">
              <option value="instagram" ${item.icon === 'instagram' ? 'selected' : ''}>Instagram</option>
              <option value="facebook" ${item.icon === 'facebook' ? 'selected' : ''}>Facebook</option>
              <option value="tiktok" ${item.icon === 'tiktok' ? 'selected' : ''}>TikTok</option>
              <option value="x" ${item.icon === 'x' ? 'selected' : ''}>X</option>
              <option value="youtube" ${item.icon === 'youtube' ? 'selected' : ''}>YouTube</option>
              <option value="linkedin" ${item.icon === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
              <option value="link" ${item.icon === 'link' ? 'selected' : ''}>Link</option>
            </select>
            <input type="url" value="${escapeHtml(item.url)}" data-social-url="${item.id}" aria-label="Social URL">
          </div>
          <div class="boh-row-actions">
            <button type="button" class="boh-action-save" data-update-social="${item.id}">Save</button>
            <button type="button" class="boh-action-remove" data-remove-social="${item.id}">Remove</button>
          </div>
        </div>
      `)
      .join('');

  adminList.querySelectorAll('[data-update-social]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-update-social');
      const label = adminList.querySelector(`[data-social-label="${id}"]`)?.value.trim() || '';
      const icon = adminList.querySelector(`[data-social-icon="${id}"]`)?.value || 'link';
      const url = adminList.querySelector(`[data-social-url="${id}"]`)?.value.trim() || '';
      if (!label || !url) {
        setStatus('Social update needs a valid label and URL.');
        return;
      }
      updateSocialLink(id, { label, icon, url });
    });
  });

  adminList.querySelectorAll('[data-remove-social]').forEach((btn) => {
    btn.addEventListener('click', () => removeSocialLink(btn.getAttribute('data-remove-social')));
  });
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

async function uploadImageFromInput(fileInput, scope) {
  if (!syncSettings.token) {
    throw new Error('Enter and save a GitHub token in Sync settings first.');
  }
  const file = fileInput.files?.[0];
  if (!file) {
    throw new Error('Choose an image file first.');
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Image is too large. Keep it under 8MB.');
  }

  const cleanName = sanitizeFileName(file.name || `${scope}-image`);
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const repoPath = `images/uploads/${scope}-${timestamp}-${cleanName}`;
  const contentBase64 = await readFileAsBase64(file);

  await putRepoFile({
    path: repoPath,
    message: `Upload ${scope} image from BOH`,
    contentBase64,
  });

  return repoPath;
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      if (comma === -1) {
        reject(new Error('Could not read file.'));
        return;
      }
      resolve(result.slice(comma + 1));
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

function sanitizeFileName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function putRepoFile({ path, message, contentBase64 }) {
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(syncSettings.owner)}/${encodeURIComponent(syncSettings.repo)}/contents/${encodeGitHubPath(path)}`;
  let existingSha = null;

  const getResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(syncSettings.branch)}`, {
    headers: githubHeaders(syncSettings.token),
  });

  if (getResponse.ok) {
    const existing = await getResponse.json();
    existingSha = existing.sha || null;
  } else if (getResponse.status !== 404) {
    throw new Error(`Unable to check file: HTTP ${getResponse.status}`);
  }

  const body = {
    message,
    content: contentBase64,
    branch: syncSettings.branch,
  };
  if (existingSha) body.sha = existingSha;

  const putResponse = await fetch(endpoint, {
    method: 'PUT',
    headers: githubHeaders(syncSettings.token),
    body: JSON.stringify(body),
  });

  if (!putResponse.ok) {
    const details = await safeJson(putResponse);
    throw new Error(details?.message || `HTTP ${putResponse.status}`);
  }
}

function encodeGitHubPath(path) {
  return String(path)
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
  return decodeURIComponent(escape(atob(str.replace(/\n/g, ''))));
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
