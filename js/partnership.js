// =====================
// PARTNERSHIP APPLICATION FORM
// No backend endpoint exists for this yet, so — same approach as the
// services.html contact form — it opens the visitor's email client
// pre-filled rather than pretending to submit somewhere. Wire this to
// a real /api/partnership-application endpoint later if you want it
// to land in a database/inbox without that extra step.
// =====================
function handleApplySubmit(e) {
  e.preventDefault();

  const business = document.getElementById('pBusiness').value.trim();
  const contact  = document.getElementById('pContact').value.trim();
  const email    = document.getElementById('pEmail').value.trim();
  const phone    = document.getElementById('pPhone').value.trim();
  const type     = document.getElementById('pType').value;
  const message  = document.getElementById('pMessage').value.trim();

  const body =
    `Business: ${business}\n` +
    `Contact Person: ${contact}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone}\n` +
    `Partnership Type: ${type}\n\n` +
    `${message}`;

  const mailto = `mailto:goldmagala56@gmail.com?subject=${encodeURIComponent('[Partnership] ' + type + ' — ' + business)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  showToast('\u2709\uFE0F Opening your email app to send this application...');
}