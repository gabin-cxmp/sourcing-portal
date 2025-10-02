const SUPABASE_URL = 'https://ngylxcrcwqfrtefkrilt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neWx4Y3Jjd3FmcnRlZmtyaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTYyOTIsImV4cCI6MjA3NDc5MjI5Mn0.zUj8ACrn1Uqo44at4F6memM_8mnTi7dMpQxkEJWlstc';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');
const messageEl = document.getElementById('message');

console.log(client);

async function signInWithEmail() {
  const email = emailInput.value;
  if(!email) {
    messageEl.textContent = "Veuillez entrer un email.";
    return;
  }

  const { data, error } = await client.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: 'http://127.0.0.1:5500/dashboard.html'
    }
  });

  if(error) {
    messageEl.textContent = `Erreur: ${error.message}`;
  } else {
    messageEl.textContent = "Vérifiez votre email pour le lien de connexion.";
  }
}

submitBtn.addEventListener('click', signInWithEmail);