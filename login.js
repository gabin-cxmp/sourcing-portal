// ⚠️ CONFIGURATION - Remplace avec tes vraies valeurs Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Fonction pour afficher des messages
function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

// Gestion de la soumission du formulaire
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Vérification<span class="loading"></span>';

    try {
        // Appelle la Edge Function pour vérifier et envoyer le magic link
        const { data, error } = await supabase.functions.invoke('check-and-send-magic-link', {
            body: { email }
        });

        // Toujours vérifier data en premier (même en cas d'erreur HTTP)
        if (data && data.error) {
            showMessage('❌ ' + data.error, 'error');
            return;
        }

        // Si erreur réseau/technique sans data
        if (error && !data) {
            showMessage('❌ Erreur de connexion. Réessayez plus tard.', 'error');
            return;
        }

        // Succès !
        if (data && data.success) {
            showMessage('✅ ' + data.message, 'success');
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

// Fonction pour charger les données du supplier
async function loadSupplierData(userEmail) {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('email', userEmail)
        .single();

    if (error) throw error;

    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('supplierName').textContent = data.name || 'N/A';
    document.getElementById('supplierId').textContent = data.id || 'N/A';
    document.getElementById('supplierStatus').textContent = data.status || 'Actif';
}

// Vérifier la session au chargement
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        loginPage.style.display = 'none';
        dashboardPage.classList.add('active');
        await loadSupplierData(session.user.email);
    }
}

// Écouter les changements d'authentification
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

// Déconnexion
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// Initialisation
checkSession();