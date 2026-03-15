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
  overlay.innerHTML = '<img class="site-image-lightbox-content" alt="">';
  document.body.appendChild(overlay);

  const lightboxImg = overlay.querySelector('.site-image-lightbox-content');
  if (!lightboxImg) return;

  const closeLightbox = () => {
    overlay.classList.remove('active');
    lightboxImg.removeAttribute('src');
    document.body.classList.remove('lightbox-open');
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('#site-image-lightbox')) {
      closeLightbox();
      return;
    }

    const image = event.target.closest('img');
    if (!image) return;
    if (image.classList.contains('site-image-lightbox-content')) return;
    if (image.dataset.noLightbox === 'true') return;

    const src = image.currentSrc || image.getAttribute('src');
    if (!src) return;

    if (image.closest('a')) event.preventDefault();

    lightboxImg.src = src;
    lightboxImg.alt = image.alt || 'Expanded image';
    overlay.classList.add('active');
    document.body.classList.add('lightbox-open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });
}
