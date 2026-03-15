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
