// ─── AUTH.JS ─────────────────────────────────────────
// Handles: sign in, sign up, sign out, profile load/save

// Switch between login and signup tabs
function switchAuthTab(tab) {
  document.getElementById('login-form').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('atab-login').classList.toggle('active',  tab === 'login');
  document.getElementById('atab-signup').classList.toggle('active', tab === 'signup');
}

// Sign in with email + password
async function signIn() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  document.getElementById('login-err').textContent = '';

  if (!email || !password) {
    document.getElementById('login-err').textContent = 'Please enter your email and password.';
    return;
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) document.getElementById('login-err').textContent = error.message;
}

// Create a new account
async function signUp() {
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;

  document.getElementById('signup-err').textContent = '';
  document.getElementById('signup-ok').textContent  = '';

  if (!email || !password) {
    document.getElementById('signup-err').textContent = 'Please fill in all fields.';
    return;
  }
  if (password !== confirm) {
    document.getElementById('signup-err').textContent = 'Passwords do not match.';
    return;
  }
  if (password.length < 6) {
    document.getElementById('signup-err').textContent = 'Password must be at least 6 characters.';
    return;
  }

  const { error } = await sb.auth.signUp({ email, password });
  if (error) {
    document.getElementById('signup-err').textContent = error.message;
  } else {
    document.getElementById('signup-ok').textContent = '✓ Account created! You can now sign in.';
    // Auto switch to login tab after 1.5s
    setTimeout(() => switchAuthTab('login'), 1500);
  }
}

// Sign out
async function signOut() {
  await sb.auth.signOut();
  currentUser = null;
  jobs = [];
  document.getElementById('app').classList.remove('visible');
  document.getElementById('auth-screen').style.display = 'flex';
  // Clear sensitive fields
  document.getElementById('claude-key').value = '';
  document.getElementById('openai-key').value = '';
  document.getElementById('base-resume').value = '';
}

// Load profile data (API key + resume + provider) from Supabase
async function loadProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  if (data) {
    if (data.ai_provider) setProvider(data.ai_provider, false);
    if (data.api_key) {
      const keyField = data.ai_provider === 'openai' ? 'openai-key' : 'claude-key';
      document.getElementById(keyField).value = data.api_key;
    }
    if (data.resume) document.getElementById('base-resume').value = data.resume;
  }
}

// Save API key + provider to Supabase
async function saveProfile() {
  const apiKey = provider === 'claude'
    ? document.getElementById('claude-key').value.trim()
    : document.getElementById('openai-key').value.trim();

  const { error } = await sb.from('profiles').upsert({
    id: currentUser.id,
    api_key: apiKey,
    ai_provider: provider
  });

  const el = document.getElementById('key-saved-msg');
  if (error) {
    el.textContent = '⚠ Error: ' + error.message;
  } else {
    el.textContent = '✓ API key saved to your account!';
    setTimeout(() => el.textContent = '', 3000);
  }
}

// Save resume to Supabase
async function saveResume() {
  const resume = document.getElementById('base-resume').value.trim();
  const { error } = await sb.from('profiles').upsert({ id: currentUser.id, resume });
  const s = document.getElementById('resume-save-status');
  if (error) {
    s.textContent = '⚠ Error saving';
  } else {
    s.textContent = '✓ Saved to your account!';
    setTimeout(() => s.textContent = '', 2500);
  }
}

// Get the current API key from whichever provider is selected
function getKey() {
  return provider === 'claude'
    ? document.getElementById('claude-key').value.trim()
    : document.getElementById('openai-key').value.trim();
}

// Listen for Supabase auth state changes (login/logout)
sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
    document.getElementById('user-email-display').textContent = currentUser.email;
    await loadProfile();
    await loadJobs();
  } else {
    document.getElementById('app').classList.remove('visible');
    document.getElementById('auth-screen').style.display = 'flex';
  }
});
