// ===== GESTION DE L'AUTHENTIFICATION =====

// Données utilisateurs (stockées localement)
let users = JSON.parse(localStorage.getItem("users")) || [
    {
        id: 1,
        username: "admin",
        password: "1234", // À encoder en production
        email: "admin@eglise.com",
        egliseName: "Administration",
        role: "admin",
        createdAt: new Date().toISOString()
    }
];

let currentUser = null;

// ===== VÉRIFIER LA CONNEXION AU CHARGEMENT =====
document.addEventListener("DOMContentLoaded", function() {
    console.log("🔄 Vérification de la session...");
    checkSession();
});

function checkSession() {
    let sessionUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (sessionUser) {
        currentUser = sessionUser;
        showMainApp();
        console.log("✅ Session active pour:", currentUser.username);
    } else {
        showLoginScreen();
        console.log("⚠️ Aucune session active");
    }
}

// ===== AFFICHER L'ÉCRAN DE CONNEXION =====
function showLoginScreen() {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("mainApp").style.display = "none";
}

// ===== AFFICHER L'APPLICATION PRINCIPALE =====
function showMainApp() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("currentUser").innerText = currentUser.username;
    loadUserData();
    document.getElementById("userInfo").innerText = "🏢 " + currentUser.egliseName;

    // Configurer l'interface selon le rôle
    setupInterfaceForRole();
}

// ===== GESTION DE LA CONNEXION =====
function handleLogin() {
    let username = document.getElementById("usernameInput").value.trim();
    let password = document.getElementById("passwordInput").value;

    if (!username) {
        alert("⚠️ Veuillez entrer un nom d'utilisateur");
        return;
    }

    // Chercher l'utilisateur
    let user = users.find(u => u.username === username);

    if (!user) {
        alert("❌ Utilisateur non trouvé!");
        return;
    }

    // Pour l'admin, pas de vérification de mot de passe
    if (user.role !== "admin" && (!password || user.password !== password)) {
        alert("❌ Mot de passe incorrect!");
        return;
    }

    // Vérifier la licence pour les clients
    if (user.role === "client") {
        if (!user.licenseKey) {
            alert("❌ Vous devez avoir une licence valide pour accéder à l'application. Contactez l'administrateur.");
            return;
        }
        // Ici, on pourrait vérifier la licence via API, mais pour simplicité, on suppose qu'elle est valide si présente
    }

    // Créer la session
    currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        egliseName: user.egliseName,
        role: user.role
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("currentUserPrefix", "user_" + user.id + "_");

    // Vider les champs
    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";

    alert("✅ Bienvenue " + currentUser.username + "!");
    showMainApp();
    
    // Charger les données de l'utilisateur
    loadUserData();
}

// ===== GESTION DE L'INSCRIPTION =====
function showRegisterModal() {
    document.getElementById("registerModal").style.display = "block";
}

function closeRegisterModal() {
    document.getElementById("registerModal").style.display = "none";
}

function handleRegister() {
    let egliseName = document.getElementById("egliseNameInput").value.trim();
    let username = document.getElementById("registerUsernameInput").value.trim();
    let email = document.getElementById("registerEmailInput").value.trim();
    let password = document.getElementById("registerPasswordInput").value;
    let passwordConfirm = document.getElementById("registerPasswordConfirmInput").value;

    if (!egliseName || !username || !email || !password || !passwordConfirm) {
        alert("⚠️ Veuillez remplir tous les champs");
        return;
    }

    if (password !== passwordConfirm) {
        alert("⚠️ Les mots de passe ne correspondent pas");
        return;
    }

    if (password.length < 4) {
        alert("⚠️ Le mot de passe doit contenir au moins 4 caractères");
        return;
    }

    // Vérifier si l'utilisateur existe déjà
    if (users.some(u => u.username === username)) {
        alert("❌ Ce nom d'utilisateur existe déjà!");
        return;
    }

    if (users.some(u => u.email === email)) {
        alert("❌ Cet email est déjà utilisé!");
        return;
    }

    // Créer le nouvel utilisateur
    let newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        username: username,
        password: password, // À encoder en production!
        email: email,
        egliseName: egliseName,
        role: "client",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Compte créé avec succès! Vous pouvez maintenant vous connecter.");
    
    // Effacer le formulaire et fermer la modal
    document.getElementById("egliseNameInput").value = "";
    document.getElementById("registerUsernameInput").value = "";
    document.getElementById("registerEmailInput").value = "";
    document.getElementById("registerPasswordInput").value = "";
    document.getElementById("registerPasswordConfirmInput").value = "";
    
    closeRegisterModal();
}

// ===== CONFIGURER L'INTERFACE SELON LE RÔLE =====
function setupInterfaceForRole() {
    let navButtons = document.querySelector(".nav-buttons");

    if (currentUser.role === "admin") {
        navButtons.innerHTML = `
            <button onclick="showModule('admin')" class="btn-nav active">⚙️ Administration</button>
            <button onclick="showModule('users')" class="btn-nav">👥 Utilisateurs</button>
            <button onclick="showModule('licenses')" class="btn-nav">🔑 Licences</button>
            <button onclick="showModule('updates')" class="btn-nav">⬆️ Mises à jour</button>
            <button onclick="showModule('messages')" class="btn-nav">📧 Messages</button>
            <button onclick="showModule('meetings')" class="btn-nav">📝 Réunions</button>
        `;
    } else {
        navButtons.innerHTML = `
            <button onclick="showModule('membres')" class="btn-nav active">👤 Membres</button>
            <button onclick="showModule('dime')" class="btn-nav">💰 Dîme</button>
            <button onclick="showModule('offrande')" class="btn-nav">🙏 Offrande</button>
            <button onclick="showModule('groupe')" class="btn-nav">👥 Groupe</button>
            <button onclick="showModule('plan')" class="btn-nav">📋 Plan</button>
            <button onclick="showModule('evenement')" class="btn-nav">🎉 Événement</button>
            <button onclick="showModule('cimetiere')" class="btn-nav">⛑️ Cimetière</button>
            <button onclick="showModule('bapteme')" class="btn-nav">💧 Baptême</button>
            <button onclick="showModule('mariage')" class="btn-nav">💒 Mariage</button>
            <button onclick="showModule('objets')" class="btn-nav">📦 Objets</button>
            <button onclick="showModule('stats')" class="btn-nav">📊 Statistiques</button>
            <button onclick="showModule('messages')" class="btn-nav">📧 Messages</button>
            <button onclick="showModule('meetings')" class="btn-nav">📝 Réunions</button>
            <button onclick="showModule('reports')" class="btn-nav">📄 Rapports</button>
        `;
    }
}
function showUserMenu() {
    let menu = document.getElementById("userMenu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

// Fermer le menu en cliquant ailleurs
document.addEventListener("click", function(event) {
    let userMenu = document.getElementById("userMenu");
    let userButton = document.querySelector(".btn-user-menu");
    
    if (userMenu && !userMenu.contains(event.target) && !userButton.contains(event.target)) {
        userMenu.style.display = "none";
    }
});

// ===== CHANGEMENT DE MOT DE PASSE =====
function showChangePasswordModal() {
    document.getElementById("userMenu").style.display = "none";
    document.getElementById("changePasswordModal").style.display = "block";
}

function closeChangePasswordModal() {
    document.getElementById("changePasswordModal").style.display = "none";
    document.getElementById("currentPasswordInput").value = "";
    document.getElementById("newPasswordInput").value = "";
    document.getElementById("confirmNewPasswordInput").value = "";
}

function handleChangePassword() {
    let currentPassword = document.getElementById("currentPasswordInput").value;
    let newPassword = document.getElementById("newPasswordInput").value;
    let confirmPassword = document.getElementById("confirmNewPasswordInput").value;

    // Vérifier le mot de passe actuel
    let user = users.find(u => u.id === currentUser.id);
    
    if (user.password !== currentPassword) {
        alert("❌ Le mot de passe actuel est incorrect!");
        return;
    }

    if (!newPassword || !confirmPassword) {
        alert("⚠️ Veuillez remplir tous les champs");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("⚠️ Les nouveaux mots de passe ne correspondent pas");
        return;
    }

    if (newPassword.length < 4) {
        alert("⚠️ Le mot de passe doit contenir au moins 4 caractères");
        return;
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Mot de passe changé avec succès!");
    closeChangePasswordModal();
}

// ===== DÉCONNEXION =====
function handleLogout() {
    if (confirm("❓ Êtes-vous sûr de vouloir vous déconnecter?")) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserPrefix");
        currentUser = null;
        
        // Vider les données affichées
        document.getElementById("userInfo").innerText = "";
        document.getElementById("currentUser").innerText = "";
        
        showLoginScreen();
        alert("✅ Déconnecté avec succès!");
    }
}

// ===== GESTION DES DONNÉES PAR UTILISATEUR =====
function loadUserData() {
    // Les données seront chargées avec le préfixe de l'utilisateur
    console.log("📂 Chargement des données pour:", currentUser.username);
}

function getPrefixedKey(key) {
    if (!currentUser) return key;
    return "user_" + currentUser.id + "_" + key;
}

function saveUserData(key, data) {
    let prefixedKey = getPrefixedKey(key);
    localStorage.setItem(prefixedKey, JSON.stringify(data));
}

function getUserData(key) {
    let prefixedKey = getPrefixedKey(key);
    return JSON.parse(localStorage.getItem(prefixedKey)) || null;
}

// Correctif: chaque compte charge et sauvegarde ses propres donnees.
function loadUserData() {
    if (!currentUser) return;

    membres = getUserData("membres") || [];
    dimes = getUserData("dimes") || [];
    offrandes = getUserData("offrandes") || [];
    groupes = getUserData("groupes") || [];
    plans = getUserData("plans") || [];
    objets = getUserData("objets") || [];
    evenements = getUserData("evenements") || [];
    cimetiere = getUserData("cimetiere") || [];
    baptemes = getUserData("baptemes") || [];
    mariages = getUserData("mariages") || [];

    if (typeof displayMembres === "function") displayMembres();
    if (typeof displayDimes === "function") displayDimes();
    if (typeof displayOffrandes === "function") displayOffrandes();
    if (typeof displayGroupes === "function") displayGroupes();
    if (typeof displayPlans === "function") displayPlans();
    if (typeof displayObjets === "function") displayObjets();
    if (typeof displayEvenements === "function") displayEvenements();
    if (typeof displayCimetiere === "function") displayCimetiere();
    if (typeof displayBaptemes === "function") displayBaptemes();
    if (typeof displayMariages === "function") displayMariages();
    if (typeof updateStatistics === "function") updateStatistics();
}

function getPrefixedKey(key) {
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
    }
    if (!currentUser) return key;
    return "user_" + currentUser.id + "_" + key;
}
