const SUPABASE_URL = 'https://ngylxcrcwqfrtefkrilt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neWx4Y3Jjd3FmcnRlZmtyaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTYyOTIsImV4cCI6MjA3NDc5MjI5Mn0.zUj8ACrn1Uqo44at4F6memM_8mnTi7dMpQxkEJWlstc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');

function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Vérification<span class="loading"></span>';
    showMessage('Envoi du lien magique...', 'info');

    try {
        const { data, error } = await supabase.functions.invoke('check-and-send-magic-link', {
            body: { email }
        });

        if (error) {
            showMessage('Erreur technique : ' + error.message, 'error');
        } else if (data.error) {
            showMessage(data.error, 'error');
        } else if (data.success) {
            showMessage(data.message, 'success');
            loginForm.reset();
        }

    } catch (err) {
        console.error(err);
        showMessage('Erreur inattendue. Réessayez plus tard.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le lien magique';
    }
});

async function loadSupplierData(userEmail) {
    const { data } = await supabase
        .from('suppliers')
        .select('*')
        .eq('email', userEmail)
        .single();

    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('supplierName').textContent = data?.name || 'N/A';
    document.getElementById('supplierId').textContent = data?.id || 'N/A';
    document.getElementById('supplierStatus').textContent = data?.status || 'Actif';
}

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        loginPage.style.display = 'none';
        dashboardPage.classList.add('active');
        await loadSupplierData(session.user.email);
    }
}

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

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

checkSession();
