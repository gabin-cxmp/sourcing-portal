// ===================== CONFIGURATION =====================
const SUPABASE_URL = 'https://ngylxcrcwqfrtefkrilt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neWx4Y3Jjd3FmcnRlZmtyaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTYyOTIsImV4cCI6MjA3NDc5MjI5Mn0.zUj8ACrn1Uqo44at4F6memM_8mnTi7dMpQxkEJWlstc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================== ELEMENTS =====================
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');

// ===================== UTILS =====================
function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

// ===================== LOGIN FORM =====================
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
        try {
            // Essaye de parser JSON même si status != 200
            result = await res.json();
        } catch {
            result = {};
        }

        if (!res.ok) {
            // Affiche le message exact de l'Edge Function
            showMessage('❌ ' + (result.error || 'Erreur serveur'), 'error');
        } else {
            showMessage('✅ ' + (result.message || 'Magic link envoyé !'), 'success');
            loginForm.reset();
        }

    } catch (error) {
        console.error('Erreur inattendue:', error);
        showMessage('❌ Une erreur est survenue. Réessayez plus tard.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le lien magique';
    }
});


// ===================== DASHBOARD =====================
async function loadSupplierData(userEmail) {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('email', userEmail)
        .single();

    if (error) {
        console.error('Erreur récupération supplier:', error);
        showMessage('❌ Impossible de charger vos données', 'error');
        return;
    }

    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('supplierName').textContent = data.name || 'N/A';
    document.getElementById('supplierId').textContent = data.id || 'N/A';
    document.getElementById('supplierStatus').textContent = data.status || 'Actif';
}

// ===================== SESSION =====================
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

// Écoute les changements de session en direct
supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
        loginPage.style.display = 'none';
        dashboardPage.classList.add('active');
        await loadSupplierData(session.user.email);
    } else if (event === 'SIGNED_OUT') {
        loginPage.style.display = 'block';
        dashboardPage.classList.remove('active');
    }
});

// ===================== LOGOUT =====================
logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // UI réinitialisée
        loginPage.style.display = 'block';
        dashboardPage.classList.remove('active');
        showMessage('Vous êtes déconnecté.', 'info');

        // Force un rechargement complet pour effacer localStorage
        window.location.reload();

    } catch (err) {
        console.error('Erreur lors de la déconnexion :', err);
        showMessage('❌ Impossible de se déconnecter', 'error');
    }
});

// ===================== INITIALISATION =====================
checkSession();
