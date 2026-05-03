const LICENSE_PRICE_USD = 15;
const LICENSE_STORAGE_KEY = "licenseInfo";
const LICENSE_REQUESTS_KEY = "manualLicenseRequests";

function getAllLicenseRequests() {
    return JSON.parse(localStorage.getItem(LICENSE_REQUESTS_KEY)) || [];
}

function saveAllLicenseRequests(requests) {
    localStorage.setItem(LICENSE_REQUESTS_KEY, JSON.stringify(requests));
}

function getCurrentLicense() {
    return getUserData(LICENSE_STORAGE_KEY) || null;
}

function saveCurrentLicense(license) {
    saveUserData(LICENSE_STORAGE_KEY, license);
}

function generateLicenseKey(userId) {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    const stamp = Date.now().toString(36).toUpperCase();
    return "EM-" + userId + "-" + random + "-" + stamp;
}

function isAdminUser() {
    return currentUser && currentUser.username === "admin";
}

function submitManualPayment() {
    if (!currentUser) {
        alert("Veuillez vous connecter avant de demander une licence.");
        return;
    }

    const method = document.getElementById("paymentMethod").value;
    const phone = document.getElementById("paymentPhone").value.trim();
    const reference = document.getElementById("paymentReference").value.trim();
    const amount = parseFloat(document.getElementById("paymentAmount").value) || LICENSE_PRICE_USD;

    if (!method || !phone || !reference) {
        alert("Veuillez remplir toutes les informations du paiement.");
        return;
    }

    const requests = getAllLicenseRequests();
    const existing = requests.find(item => item.reference === reference && item.userId === currentUser.id);

    if (existing) {
        alert("Cette reference a deja ete envoyee pour ce compte.");
        return;
    }

    requests.unshift({
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        churchName: currentUser.egliseName,
        email: currentUser.email,
        method,
        phone,
        reference,
        amount,
        status: "EN_ATTENTE",
        licenseKey: "",
        createdAt: new Date().toISOString()
    });

    saveAllLicenseRequests(requests);
    document.getElementById("paymentPhone").value = "";
    document.getElementById("paymentReference").value = "";
    document.getElementById("paymentAmount").value = LICENSE_PRICE_USD;

    renderLicenceModule();
    alert("Demande envoyee. L'administrateur validera votre paiement et vous donnera une cle de licence.");
}

function approveLicenseRequest(requestId) {
    if (!isAdminUser()) {
        alert("Action reservee a l'administrateur.");
        return;
    }

    const requests = getAllLicenseRequests();
    const request = requests.find(item => item.id === requestId);

    if (!request) {
        alert("Demande introuvable.");
        return;
    }

    request.status = "APPROUVE";
    request.approvedAt = new Date().toISOString();
    request.licenseKey = request.licenseKey || generateLicenseKey(request.userId);

    saveAllLicenseRequests(requests);
    renderLicenceModule();
    alert("Paiement valide. Cle de licence generee : " + request.licenseKey);
}

function rejectLicenseRequest(requestId) {
    if (!isAdminUser()) {
        alert("Action reservee a l'administrateur.");
        return;
    }

    const requests = getAllLicenseRequests();
    const request = requests.find(item => item.id === requestId);

    if (!request) return;

    request.status = "REFUSE";
    request.rejectedAt = new Date().toISOString();
    saveAllLicenseRequests(requests);
    renderLicenceModule();
}

function copyLicenseKey(requestId) {
    const request = getAllLicenseRequests().find(item => item.id === requestId);
    if (!request || !request.licenseKey) return;

    navigator.clipboard.writeText(request.licenseKey).then(() => {
        alert("Cle copiee : " + request.licenseKey);
    }).catch(() => {
        prompt("Copiez cette cle :", request.licenseKey);
    });
}

function activateLicense() {
    if (!currentUser) {
        alert("Veuillez vous connecter.");
        return;
    }

    const key = document.getElementById("licenseKeyInput").value.trim();
    const request = getAllLicenseRequests().find(item =>
        item.userId === currentUser.id &&
        item.licenseKey === key &&
        item.status === "APPROUVE"
    );

    if (!request) {
        alert("Cle invalide ou paiement pas encore valide.");
        return;
    }

    const license = {
        key,
        status: "ACTIVE",
        userId: currentUser.id,
        churchName: currentUser.egliseName,
        activatedAt: new Date().toISOString(),
        expiresAt: "A VIE"
    };

    saveCurrentLicense(license);
    document.getElementById("licenseKeyInput").value = "";
    renderLicenceModule();
    alert("Licence activee avec succes.");
}

function renderLicenceStatus() {
    const box = document.getElementById("licenceStatusBox");
    const text = document.getElementById("licenceStatusText");
    if (!box || !text) return;

    const license = getCurrentLicense();

    if (license && license.status === "ACTIVE") {
        box.className = "licence-status active";
        text.innerHTML = "<strong>ACTIVE</strong><br>Cle : " + license.key + "<br>Licence : " + license.expiresAt;
        return;
    }

    const pending = getAllLicenseRequests().find(item => currentUser && item.userId === currentUser.id && item.status === "EN_ATTENTE");
    const approved = getAllLicenseRequests().find(item => currentUser && item.userId === currentUser.id && item.status === "APPROUVE");

    if (approved) {
        box.className = "licence-status ready";
        text.innerHTML = "<strong>Paiement valide</strong><br>Votre cle est prete : " + approved.licenseKey;
        return;
    }

    if (pending) {
        box.className = "licence-status pending";
        text.innerHTML = "<strong>EN ATTENTE</strong><br>Votre paiement est en verification.";
        return;
    }

    box.className = "licence-status";
    text.innerHTML = "<strong>NON ACTIVE</strong><br>Envoyez une demande apres votre paiement Mobile Money.";
}

function renderAdminLicenseRequests() {
    const panel = document.getElementById("adminLicensePanel");
    const list = document.getElementById("licenseRequestsList");
    if (!panel || !list) return;

    panel.style.display = isAdminUser() ? "block" : "none";
    if (!isAdminUser()) return;

    const requests = getAllLicenseRequests();

    if (requests.length === 0) {
        list.innerHTML = "<p class='empty-state'>Aucune demande de licence pour le moment.</p>";
        return;
    }

    list.innerHTML = requests.map(request => `
        <div class="license-request">
            <div>
                <strong>${request.churchName || request.username}</strong>
                <small>${request.method} - ${request.phone} - ${request.amount} USD</small>
                <small>Reference: ${request.reference}</small>
                <small>Compte: ${request.username} | Statut: ${request.status}</small>
                ${request.licenseKey ? `<small>Cle: ${request.licenseKey}</small>` : ""}
            </div>
            <div class="license-actions">
                ${request.status === "EN_ATTENTE" ? `<button onclick="approveLicenseRequest('${request.id}')" class="btn-add">Valider</button>` : ""}
                ${request.licenseKey ? `<button onclick="copyLicenseKey('${request.id}')" class="btn-export">Copier</button>` : ""}
                ${request.status !== "REFUSE" ? `<button onclick="rejectLicenseRequest('${request.id}')" class="btn-danger">Refuser</button>` : ""}
            </div>
        </div>
    `).join("");
}

function renderLicenceModule() {
    renderLicenceStatus();
    renderAdminLicenseRequests();
}

const originalLoadUserDataForLicense = loadUserData;
loadUserData = function() {
    originalLoadUserDataForLicense();
    renderLicenceModule();
};

document.addEventListener("DOMContentLoaded", function() {
    renderLicenceModule();
});
