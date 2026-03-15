initImageLightbox();

const requestForm = document.getElementById('investor-request-form');
const requestStatus = document.getElementById('request-status');

if (requestForm && requestStatus) {
  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('request-name')?.value.trim() || '';
    const email = document.getElementById('request-email')?.value.trim() || '';
    const company = document.getElementById('request-company')?.value.trim() || '';

    const subject = encodeURIComponent('Request: Full 59-Page Business Plan & Financial Model');
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nPlease send the full 59-page business plan and financial model.`
    );

    requestStatus.textContent = 'Request prepared. Opening your email app now.';
    window.location.href = `mailto:investors@bldsantamonica.com?subject=${subject}&body=${body}`;
  });
}

function initImageLightbox() {
  if (document.getElementById('site-image-lightbox')) return;

  const overlay = document.createElement('div');
  overlay.id = 'site-image-lightbox';
  overlay.className = 'site-image-lightbox';
  overlay.innerHTML = `
    <button type="button" class="site-lightbox-arrow prev" aria-label="Previous image">&lsaquo;</button>
    <img class="site-image-lightbox-content" alt="">
    <button type="button" class="site-lightbox-arrow next" aria-label="Next image">&rsaquo;</button>
    <p class="site-lightbox-count" aria-live="polite"></p>
  `;
  document.body.appendChild(overlay);

  const lightboxImg = overlay.querySelector('.site-image-lightbox-content');
  const prevBtn = overlay.querySelector('.site-lightbox-arrow.prev');
  const nextBtn = overlay.querySelector('.site-lightbox-arrow.next');
  const countText = overlay.querySelector('.site-lightbox-count');
  if (!lightboxImg || !prevBtn || !nextBtn || !countText) return;

  let currentGroup = [];
  let currentIndex = 0;

  const groupSelectors = [
    '.gallery img',
    '.menu-meals img',
    '.merch-grid img',
    '.insta-posts img',
  ];

  const isEligible = (img) => {
    if (!img) return false;
    if (img.classList.contains('site-image-lightbox-content')) return false;
    if (img.dataset.noLightbox === 'true') return false;
    const src = img.currentSrc || img.getAttribute('src');
    return Boolean(src);
  };

  const getGroupForImage = (clickedImage) => {
    for (const selector of groupSelectors) {
      const group = Array.from(document.querySelectorAll(selector)).filter(isEligible);
      if (group.includes(clickedImage)) return group;
    }
    return [clickedImage];
  };

  const renderCurrent = () => {
    if (!currentGroup.length) return;
    const item = currentGroup[currentIndex];
    const src = item.currentSrc || item.getAttribute('src');
    lightboxImg.src = src || '';
    lightboxImg.alt = item.alt || 'Expanded image';
    countText.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
  };

  const moveBy = (delta) => {
    if (currentGroup.length <= 1) return;
    currentIndex = (currentIndex + delta + currentGroup.length) % currentGroup.length;
    renderCurrent();
  };

  const closeLightbox = () => {
    overlay.classList.remove('active');
    lightboxImg.removeAttribute('src');
    countText.textContent = '';
    currentGroup = [];
    currentIndex = 0;
    document.body.classList.remove('lightbox-open');
  };

  const openLightbox = (clickedImage) => {
    const group = getGroupForImage(clickedImage);
    currentGroup = group;
    currentIndex = Math.max(0, group.indexOf(clickedImage));
    renderCurrent();
    overlay.classList.add('active');
    document.body.classList.add('lightbox-open');
  };

  prevBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    moveBy(-1);
  });

  nextBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    moveBy(1);
  });

  overlay.addEventListener('click', () => {
    closeLightbox();
  });

  document.addEventListener('click', (event) => {
    const image = event.target.closest('img');
    if (!image) return;
    if (!isEligible(image)) return;
    if (image.closest('#site-image-lightbox')) return;

    const src = image.currentSrc || image.getAttribute('src');
    if (!src) return;

    if (image.closest('a')) event.preventDefault();
    openLightbox(image);
  });

  document.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('active')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') moveBy(1);
    if (event.key === 'ArrowLeft') moveBy(-1);
  });
}
