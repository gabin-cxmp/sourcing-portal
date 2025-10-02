// --- Configuration Supabase ---
const SUPABASE_URL = "https://ngylxcrcwqfrtefkrilt.supabase.co";
const SUPABASE_ANON_KEY = "TON_ANON_KEY_ICI";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Sélecteurs DOM ---
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submitBtn");
const messageEl = document.getElementById("message");

// --- Fonction de login ---
async function signInWithMagicLink(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    messageEl.textContent = "❌ Veuillez entrer un email.";
    return;
  }

  // Désactiver le bouton + loader
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "⏳ Envoi en cours...";

  // Appel à Supabase
  const { data, error } = await client.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: "http://127.0.0.1:5500/dashboard.html",
    },
  });

  // Réactiver le bouton
  submitBtn.disabled = false;
  submitBtn.textContent = originalText;

  // Vérifier la réponse
  if (error) {
    if (error.message.includes("User not found")) {
      messageEl.textContent = "❌ Ce compte n'existe pas.";
    } else {
      messageEl.textContent = `❌ Erreur: ${error.message}`;
    }
  } else {
    messageEl.textContent = "✅ MagicLink envoyé. Vérifiez vos emails !";
  }
}

// --- Événement form submit ---
loginForm.addEventListener("submit", signInWithMagicLink);
