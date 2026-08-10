// =====================
// PARTNERSHIP APPLICATION FORM
// No backend endpoint exists for this yet, so — same approach as the
// services.html contact form — it opens the visitor's email client
// pre-filled rather than pretending to submit somewhere. Wire this to
// a real /api/partnership-application endpoint later if you want it
// to land in a database/inbox without that extra step.
// =====================
async function handleApplySubmit(e) {
  e.preventDefault();

  const business = document.getElementById('pBusiness').value.trim();
  const contact  = document.getElementById('pContact').value.trim();
  const email    = document.getElementById('pEmail').value.trim();
  const phone    = document.getElementById('pPhone').value.trim();
  const type     = document.getElementById('pType').value;
  const message  = document.getElementById('pMessage').value.trim();

  try {
    const res = await fetch('/api/partnership-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business, contact, email, phone, type, message }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('\u2705 Application submitted! We\u2019ll be in touch within 2 business days.');
      document.getElementById('applyForm').reset();
    } else {
      showToast('\u274C ' + (data.message || 'Could not submit application'));
    }
  } catch (err) {
    showToast('\u274C Could not reach server \u2014 please try again');
  }
}