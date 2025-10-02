const SUPABASE_URL = 'https://ngylxcrcwqfrtefkrilt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neWx4Y3Jjd3FmcnRlZmtyaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTYyOTIsImV4cCI6MjA3NDc5MjI5Mn0.zUj8ACrn1Uqo44at4F6memM_8mnTi7dMpQxkEJWlstc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements DOM
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Affichage messages
function showMessage(text, type = 'info') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

// --- LOGIN FORM ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Vérification<span class="loading"></span>';
  showMessage('Envoi du lien magique...', 'info');

  try {
    const res = await fetch('/functions/check-and-send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    let result;
    try { result = await res.json(); } catch { result = {}; }

    if (!res.ok) {
      showMessage('❌ ' + (result.error || 'Erreur serveur'), 'error');
    } else {
      showMessage('✅ ' + (result.message || 'Magic link envoyé à votre adresse email !'), 'success');
      loginForm.reset();
    }

  } catch (err) {
    console.error(err);
    showMessage('❌ Une erreur est survenue. Réessayez plus tard.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Envoyer le lien magique';
  }
});

// --- CHARGER LES INFOS SUPPLIER ---
async function loadSupplierData(userEmail) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('email', userEmail)
    .single();

  if (error) {
    console.error('Erreur chargement supplier:', error);
    showMessage('❌ Impossible de charger vos informations.', 'error');
    return;
  }

  document.getElementById('userEmail').textContent = userEmail;
  document.getElementById('supplierName').textContent = data.name || 'N/A';
  document.getElementById('supplierId').textContent = data.id || 'N/A';
  document.getElementById('supplierStatus').textContent = data.status || 'Actif';
}

// --- CHECK SESSION AU LOAD ---
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    loginPage.style.display = 'none';
    dashboardPage.classList.add('active');
    await loadSupplierData(session.user.email);
  } else {
    loginPage.style.display = 'block';
    dashboardPage.classList.remove('active');
  }
}

// --- ÉCOUTER CHANGEMENTS AUTH ---
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    loginPage.style.display = 'none';
    dashboardPage.classList.add('active');
    await loadSupplierData(session.user.email);
  } else if (event === 'SIGNED_OUT') {
    loginPage.style.display = 'block';
    dashboardPage.classList.remove('active');
    showMessage('Vous êtes déconnecté.', 'info');
  }
});

// --- LOGOUT ---
logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur déconnexion:', error);
    showMessage('❌ Impossible de se déconnecter.', 'error');
    return;
  }
  loginPage.style.display = 'block';
  dashboardPage.classList.remove('active');
  showMessage('Vous êtes déconnecté.', 'info');
});

// --- INIT ---
checkSession();
