// ─── APP.JS ──────────────────────────────────────────
// Handles: shared state, navigation, provider switching,
//          utility functions used across all other files

// ─── SHARED STATE ────────────────────────────────────
let currentUser       = null;   // logged-in Supabase user
let jobs              = [];     // current user's job list
let provider          = 'claude'; // 'claude' or 'openai'
let selectedEmailType = 'cold outreach';

// ─── NAVIGATION ──────────────────────────────────────
function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  document.getElementById('nav-'  + p).classList.add('active');
  if (p === 'dashboard') renderDashboard();
}

function showTab(t) {
  document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.getElementById(t).classList.add('active');
  document.getElementById('t' + t).classList.add('active');
}

// ─── AI PROVIDER SWITCHER ─────────────────────────────
function setProvider(p, save = true) {
  provider = p;

  document.getElementById('btn-claude').classList.toggle('active', p === 'claude');
  document.getElementById('btn-openai').classList.toggle('active', p === 'openai');
  document.getElementById('claude-key-section').style.display = p === 'claude' ? 'block' : 'none';
  document.getElementById('openai-key-section').style.display = p === 'openai' ? 'block' : 'none';
}

// ─── COPY TO CLIPBOARD ───────────────────────────────
function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(`[onclick="copyText('${id}')"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = original, 1500);
    }
  });
}
