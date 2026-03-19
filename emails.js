// ─── EMAILS.JS ───────────────────────────────────────
// Handles: AI-generated professional email templates

// Select an email type chip
function selectEmailType(el, type) {
  selectedEmailType = type;
  document.querySelectorAll('#email-type-chips .chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}

// Generate email using AI
async function generateEmail() {
  const name    = document.getElementById('e-name').value.trim()    || '[Your Name]';
  const company = document.getElementById('e-company').value.trim() || 'the company';
  const context = document.getElementById('e-context').value.trim();
  const resume  = document.getElementById('base-resume').value || '';

  const card = document.getElementById('email-result-card');
  const out  = document.getElementById('email-template-out');

  card.style.display = 'block';
  out.textContent    = '';
  out.classList.add('loading');

  const prompt = `Write a professional ${selectedEmailType} email.
Sender: ${name}
Recipient/Company: ${company}
${context ? 'Context: ' + context : ''}
${resume ? 'Sender background (brief): ' + resume.substring(0, 500) : ''}

Write ONLY the email. Start with "Subject: ..." then the body.
Keep it concise, warm, and professional. Sound human, not templated.`;

  try {
    const text = await callAI(prompt, 600);
    out.classList.remove('loading');
    out.textContent = text;
  } catch (e) {
    out.classList.remove('loading');
    out.textContent = 'Error: ' + e.message;
  }
}
