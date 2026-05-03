// ===== VARIABLES GLOBALES =====
let devise = "USD";
let deviseSymbols = {
    USD: "$",
    FRF: "F",
    EUR: "€",
    XAF: "F"
};

// ===== DATA INITIALIZATION =====
let membres = getUserData("membres") || [];
let dimes = getUserData("dimes") || [];
let offrandes = getUserData("offrandes") || [];
let groupes = getUserData("groupes") || [];
let plans = getUserData("plans") || [];
let objets = getUserData("objets") || [];
let evenements = getUserData("evenements") || [];
let cimetiere = getUserData("cimetiere") || [];
let baptemes = getUserData("baptemes") || [];
let mariages = getUserData("mariages") || [];
let messages = [];
let meetings = [];

// ===== UTILITY FUNCTIONS =====
function showModule(id) {
    document.querySelectorAll(".module").forEach(m => m.style.display = "none");
    document.querySelectorAll(".btn-nav").forEach(btn => btn.classList.remove("active"));
    const module = document.getElementById(id);
    if (module) {
        module.style.display = "block";
    }
    if (event && event.target) {
        event.target.classList.add("active");
    }
}

function saveToStorage(key, data) {
    saveUserData(key, data);
}

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('fr-FR');
}

function formatMoney(amount) {
    if (isNaN(amount) || amount === null) {
        amount = 0;
    }
    amount = parseFloat(amount) || 0;
    return deviseSymbols[devise] + " " + amount.toFixed(2).replace(".", ",");
}

function changeDevise() {
    devise = document.getElementById("deviseSelect").value;
    const selectElement = document.getElementById("deviseSelect");
    const deviseLabel = selectElement.options[selectElement.selectedIndex].text;
    document.getElementById("deviseActuelle").innerText = "Devise: " + deviseLabel;
    
    displayDimes();
    displayOffrandes();
    updateStatistics();
    alert("✅ Devise changée en " + deviseLabel);
}

function calculateTotal(array, key) {
    return array.reduce((sum, item) => {
        const val = parseFloat(item[key]) || 0;
        return sum + val;
    }, 0);
}

function calculateAverage(array, key) {
    if (array.length === 0) return 0;
    return calculateTotal(array, key) / array.length;
}

// ===== MEMBRES =====
function addMembre() {
    const nom = document.getElementById("nomMembre").value.trim();
    const email = document.getElementById("emailMembre").value.trim();
    const telephone = document.getElementById("telephoneMembre").value.trim();
    const adresse = document.getElementById("adresseMembre").value.trim();
    const dateNaissance = document.getElementById("dateNaissanceMembre").value;
    const profession = document.getElementById("professionMembre").value.trim();
    const sexe = document.getElementById("sexeMembre").value;
    const status = document.getElementById("statusMembre").value;
    const dateAdhere = document.getElementById("dateAdhereMembre").value;
    const fonction = document.getElementById("fonctionMembre").value;
    const remarque = document.getElementById("remarqueMembre").value.trim();

    if (!nom || !telephone || !adresse || !sexe || !status || !dateAdhere) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires");
        return;
    }

    if (membres.some(m => m.telephone === telephone)) {
        alert("⚠️ Ce numéro de téléphone existe déjà");
        return;
    }

    membres.push({
        id: Date.now(),
        nom,
        email,
        telephone,
        adresse,
        dateNaissance,
        profession,
        sexe,
        status,
        dateAdhere,
        fonction,
        remarque
    });

    saveToStorage("membres", membres);
    clearMembreForm();
    displayMembres();
    updateStatistics();
    alert("✅ Membre ajouté avec succès");
}

function clearMembreForm() {
    document.getElementById("nomMembre").value = "";
    document.getElementById("emailMembre").value = "";
    document.getElementById("telephoneMembre").value = "";
    document.getElementById("adresseMembre").value = "";
    document.getElementById("dateNaissanceMembre").value = "";
    document.getElementById("professionMembre").value = "";
    document.getElementById("sexeMembre").value = "";
    document.getElementById("statusMembre").value = "";
    document.getElementById("dateAdhereMembre").value = "";
    document.getElementById("fonctionMembre").value = "";
    document.getElementById("remarqueMembre").value = "";
}

function displayMembres() {
    const tbody = document.querySelector("#membreTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (membres.length === 0) {
        tbody.innerHTML = "<tr><td colspan='9' style='text-align:center; padding: 20px;'>Aucun membre enregistré</td></tr>";
        updateMembresStats(0, 0, 0, 0);
        return;
    }

    let actifs = 0;
    let hommes = 0;
    let femmes = 0;

    membres.forEach((m, index) => {
        if (m.status === "Actif") actifs++;
        if (m.sexe === "Homme") hommes++;
        if (m.sexe === "Femme") femmes++;

        const statusColor = m.status === "Actif" ? "#28a745" : m.status === "Inactif" ? "#dc3545" : "#ffc107";
        
        tbody.innerHTML += `<tr>
            <td><strong>${m.nom}</strong></td>
            <td>${m.telephone}</td>
            <td>${m.email || "-"}</td>
            <td>${m.adresse}</td>
            <td>${m.sexe}</td>
            <td>${m.fonction || "-"}</td>
            <td><span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold;">${m.status}</span></td>
            <td>${formatDate(m.dateAdhere)}</td>
            <td>
                <button onclick="viewMembre(${index})" class="btn-view">👁️ Voir</button>
                <button onclick="editMembre(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteMembre(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });

    updateMembresStats(membres.length, actifs, hommes, femmes);
}

function updateMembresStats(total, actifs, hommes, femmes) {
    const totalMembre = document.getElementById("totalMembre");
    if (totalMembre) totalMembre.innerText = total;
    const membresActifsEl = document.getElementById("membresActifs");
    if (membresActifsEl) membresActifsEl.innerText = actifs;
    const membresHommesEl = document.getElementById("membresHommes");
    if (membresHommesEl) membresHommesEl.innerText = hommes;
    const membresFemmesEl = document.getElementById("membresFemmes");
    if (membresFemmesEl) membresFemmesEl.innerText = femmes;
}

function viewMembre(index) {
    const m = membres[index];
    alert(`
👤 PROFIL MEMBRE
================
Nom: ${m.nom}
Email: ${m.email || "-"}
Téléphone: ${m.telephone}
Adresse: ${m.adresse}
Date de naissance: ${formatDate(m.dateNaissance)}
Profession: ${m.profession || "-"}
Sexe: ${m.sexe}
Statut: ${m.status}
Fonction: ${m.fonction || "Aucune"}
Date d'adhésion: ${formatDate(m.dateAdhere)}
Remarques: ${m.remarque || "-"}
    `);
}

function deleteMembre(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer ce membre?")) {
        membres.splice(index, 1);
        saveToStorage("membres", membres);
        displayMembres();
        updateStatistics();
        alert("✅ Membre supprimé");
    }
}

function editMembre(index) {
    const m = membres[index];
    document.getElementById("nomMembre").value = m.nom;
    document.getElementById("emailMembre").value = m.email;
    document.getElementById("telephoneMembre").value = m.telephone;
    document.getElementById("adresseMembre").value = m.adresse;
    document.getElementById("dateNaissanceMembre").value = m.dateNaissance;
    document.getElementById("professionMembre").value = m.profession;
    document.getElementById("sexeMembre").value = m.sexe;
    document.getElementById("statusMembre").value = m.status;
    document.getElementById("dateAdhereMembre").value = m.dateAdhere;
    document.getElementById("fonctionMembre").value = m.fonction;
    document.getElementById("remarqueMembre").value = m.remarque;
    deleteMembre(index);
}

// ===== DÎMES =====
function addDime() {
    const nom = document.getElementById("nomDime").value.trim();
    const montant = parseFloat(document.getElementById("montantDime").value) || 0;
    const date = document.getElementById("dateDime").value;
    const telephone = document.getElementById("telephoneDime").value.trim();
    const desc = document.getElementById("descDime").value.trim();

    if (!nom || !date || montant <= 0) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires avec des valeurs valides");
        return;
    }

    dimes.push({
        id: Date.now(),
        nom,
        montant: parseFloat(montant.toFixed(2)),
        date,
        telephone,
        desc
    });

    saveToStorage("dimes", dimes);
    clearDimeForm();
    displayDimes();
    updateStatistics();
    alert("✅ Dîme ajoutée avec succès");
}

function clearDimeForm() {
    document.getElementById("nomDime").value = "";
    document.getElementById("montantDime").value = "";
    document.getElementById("dateDime").value = "";
    document.getElementById("telephoneDime").value = "";
    document.getElementById("descDime").value = "";
}

function displayDimes() {
    const tbody = document.querySelector("#dimeTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (dimes.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding: 20px;'>Aucune dîme enregistrée</td></tr>";
        updateDimesStats(0, 0, 0);
        return;
    }

    const total = calculateTotal(dimes, "montant");
    const moyenne = calculateAverage(dimes, "montant");

    dimes.forEach((d, index) => {
        tbody.innerHTML += `<tr>
            <td><strong>${d.nom}</strong></td>
            <td>${formatMoney(d.montant)}</td>
            <td>${formatDate(d.date)}</td>
            <td>${d.telephone || "-"}</td>
            <td>${d.desc || "-"}</td>
            <td>
                <button onclick="editDime(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteDime(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });

    updateDimesStats(total, dimes.length, moyenne);
}

function updateDimesStats(total, count, moyenne) {
    const totalDime = document.getElementById("totalDime");
    if (totalDime) totalDime.innerText = formatMoney(total);
    const countDime = document.getElementById("countDime");
    if (countDime) countDime.innerText = count;
    const moyenneDime = document.getElementById("moyenneDime");
    if (moyenneDime) moyenneDime.innerText = formatMoney(moyenne);
}

function deleteDime(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer cette dîme?")) {
        dimes.splice(index, 1);
        saveToStorage("dimes", dimes);
        displayDimes();
        updateStatistics();
        alert("✅ Dîme supprimée");
    }
}

function editDime(index) {
    const d = dimes[index];
    document.getElementById("nomDime").value = d.nom;
    document.getElementById("montantDime").value = d.montant;
    document.getElementById("dateDime").value = d.date;
    document.getElementById("telephoneDime").value = d.telephone;
    document.getElementById("descDime").value = d.desc;
    deleteDime(index);
}

// ===== OFFRANDES =====
function addOffrande() {
    const nom = document.getElementById("nomOffrande").value.trim();
    const montant = parseFloat(document.getElementById("montantOffrande").value) || 0;
    const date = document.getElementById("dateOffrande").value;
    const type = document.getElementById("typeOffrande").value;
    const desc = document.getElementById("descOffrande").value.trim();

    if (!nom || !date || montant <= 0 || !type) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires avec des valeurs valides");
        return;
    }

    offrandes.push({
        id: Date.now(),
        nom,
        montant: parseFloat(montant.toFixed(2)),
        date,
        type,
        desc
    });

    saveToStorage("offrandes", offrandes);
    clearOffrandeForm();
    displayOffrandes();
    updateStatistics();
    alert("✅ Offrande ajoutée avec succès");
}

function clearOffrandeForm() {
    document.getElementById("nomOffrande").value = "";
    document.getElementById("montantOffrande").value = "";
    document.getElementById("dateOffrande").value = "";
    document.getElementById("typeOffrande").value = "";
    document.getElementById("descOffrande").value = "";
}

function displayOffrandes() {
    const tbody = document.querySelector("#offrande-table tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (offrandes.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding: 20px;'>Aucune offrande enregistrée</td></tr>";
        updateOffrandesStats(0, 0, 0);
        return;
    }

    const total = calculateTotal(offrandes, "montant");
    const moyenne = calculateAverage(offrandes, "montant");

    offrandes.forEach((o, index) => {
        tbody.innerHTML += `<tr>
            <td><strong>${o.nom}</strong></td>
            <td>${formatMoney(o.montant)}</td>
            <td><span class="status-badge">${o.type}</span></td>
            <td>${formatDate(o.date)}</td>
            <td>${o.desc || "-"}</td>
            <td>
                <button onclick="editOffrande(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteOffrande(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });

    updateOffrandesStats(total, offrandes.length, moyenne);
}

function updateOffrandesStats(total, count, moyenne) {
    const totalOffrande = document.getElementById("totalOffrande");
    if (totalOffrande) totalOffrande.innerText = formatMoney(total);
    const countOffrande = document.getElementById("countOffrande");
    if (countOffrande) countOffrande.innerText = count;
    const moyenneOffrande = document.getElementById("moyenneOffrande");
    if (moyenneOffrande) moyenneOffrande.innerText = formatMoney(moyenne);
}

function deleteOffrande(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer cette offrande?")) {
        offrandes.splice(index, 1);
        saveToStorage("offrandes", offrandes);
        displayOffrandes();
        updateStatistics();
        alert("✅ Offrande supprimée");
    }
}

function editOffrande(index) {
    const o = offrandes[index];
    document.getElementById("nomOffrande").value = o.nom;
    document.getElementById("montantOffrande").value = o.montant;
    document.getElementById("dateOffrande").value = o.date;
    document.getElementById("typeOffrande").value = o.type;
    document.getElementById("descOffrande").value = o.desc;
    deleteOffrande(index);
}

// ===== GROUPES =====
function addGroupe() {
    const nom = document.getElementById("nomGroupe").value.trim();
    const responsable = document.getElementById("responsableGroupe").value.trim();
    const membres_count = parseInt(document.getElementById("membresGroupe").value) || 0;
    const dateCreation = document.getElementById("dateCreationGroupe").value;
    const desc = document.getElementById("descGroupe").value.trim();

    if (!nom || !responsable || membres_count <= 0) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires avec des valeurs valides");
        return;
    }

    groupes.push({
        id: Date.now(),
        nom,
        responsable,
        membres: membres_count,
        dateCreation,
        desc
    });

    saveToStorage("groupes", groupes);
    clearGroupeForm();
    displayGroupes();
    updateStatistics();
    alert("✅ Groupe ajouté avec succès");
}

function clearGroupeForm() {
    document.getElementById("nomGroupe").value = "";
    document.getElementById("responsableGroupe").value = "";
    document.getElementById("membresGroupe").value = "";
    document.getElementById("dateCreationGroupe").value = "";
    document.getElementById("descGroupe").value = "";
}

function displayGroupes() {
    const container = document.getElementById("groupeList");
    if (!container) return;
    
    container.innerHTML = "";

    if (groupes.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; color: #999;'>Aucun groupe créé</p>";
        return;
    }

    groupes.forEach((g, index) => {
        container.innerHTML += `
            <div class="card">
                <h3>👥 ${g.nom}</h3>
                <p><strong>Responsable:</strong> ${g.responsable}</p>
                <p><strong>Membres:</strong> ${g.membres}</p>
                <p><strong>Créé le:</strong> ${formatDate(g.dateCreation)}</p>
                <p><strong>Description:</strong> ${g.desc || "-"}</p>
                <div class="card-footer">
                    <button onclick="editGroupe(${index})" class="btn-edit">✏️ Éditer</button>
                    <button onclick="deleteGroupe(${index})" class="btn-delete">🗑️ Supprimer</button>
                </div>
            </div>
        `;
    });
}

function deleteGroupe(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer ce groupe?")) {
        groupes.splice(index, 1);
        saveToStorage("groupes", groupes);
        displayGroupes();
        updateStatistics();
        alert("✅ Groupe supprimé");
    }
}

function editGroupe(index) {
    const g = groupes[index];
    document.getElementById("nomGroupe").value = g.nom;
    document.getElementById("responsableGroupe").value = g.responsable;
    document.getElementById("membresGroupe").value = g.membres;
    document.getElementById("dateCreationGroupe").value = g.dateCreation;
    document.getElementById("descGroupe").value = g.desc;
    deleteGroupe(index);
}

// ===== PLANS =====
function addPlan() {
    const titre = document.getElementById("titrePlan").value.trim();
    const desc = document.getElementById("descPlan").value.trim();
    const date = document.getElementById("datePlan").value;
    const status = document.getElementById("statusPlan").value;

    if (!titre || !desc || !date || !status) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires");
        return;
    }

    plans.push({
        id: Date.now(),
        titre,
        desc,
        date,
        status: status || "En attente"
    });

    saveToStorage("plans", plans);
    clearPlanForm();
    displayPlans();
    updateStatistics();
    alert("�� Plan ajouté avec succès");
}

function clearPlanForm() {
    document.getElementById("titrePlan").value = "";
    document.getElementById("descPlan").value = "";
    document.getElementById("datePlan").value = "";
    document.getElementById("statusPlan").value = "";
}

function displayPlans() {
    const container = document.getElementById("planList");
    if (!container) return;
    
    container.innerHTML = "";

    if (plans.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; color: #999;'>Aucun plan créé</p>";
        return;
    }

    plans.forEach((p, index) => {
        const status = p.status || "En attente";
        const statusClass = status.toLowerCase().replace(/\s+/g, "-");
        
        container.innerHTML += `
            <div class="card">
                <h3>📋 ${p.titre}</h3>
                <p>${p.desc}</p>
                <p><strong>Date:</strong> ${formatDate(p.date)}</p>
                <span class="status-badge ${statusClass}">${status}</span>
                <div class="card-footer">
                    <button onclick="editPlan(${index})" class="btn-edit">✏️ Éditer</button>
                    <button onclick="deletePlan(${index})" class="btn-delete">🗑️ Supprimer</button>
                </div>
            </div>
        `;
    });
}

function deletePlan(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer ce plan?")) {
        plans.splice(index, 1);
        saveToStorage("plans", plans);
        displayPlans();
        updateStatistics();
        alert("✅ Plan supprimé");
    }
}

function editPlan(index) {
    const p = plans[index];
    document.getElementById("titrePlan").value = p.titre;
    document.getElementById("descPlan").value = p.desc;
    document.getElementById("datePlan").value = p.date;
    document.getElementById("statusPlan").value = p.status;
    deletePlan(index);
}

// ===== ÉVÉNEMENTS =====
function addEvenement() {
    const nom = document.getElementById("nomEvenement").value.trim();
    const desc = document.getElementById("descEvenement").value.trim();
    const date = document.getElementById("dateEvenement").value;
    const heure = document.getElementById("heureEvenement").value;
    const lieu = document.getElementById("lieuEvenement").value.trim();
    const participants = parseInt(document.getElementById("participantsEvenement").value) || 0;

    if (!nom || !desc || !date || !lieu) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires");
        return;
    }

    evenements.push({
        id: Date.now(),
        nom,
        desc,
        date,
        heure,
        lieu,
        participants
    });

    saveToStorage("evenements", evenements);
    clearEvenementForm();
    displayEvenements();
    updateStatistics();
    alert("✅ Événement ajouté avec succès");
}

function clearEvenementForm() {
    document.getElementById("nomEvenement").value = "";
    document.getElementById("descEvenement").value = "";
    document.getElementById("dateEvenement").value = "";
    document.getElementById("heureEvenement").value = "";
    document.getElementById("lieuEvenement").value = "";
    document.getElementById("participantsEvenement").value = "";
}

function displayEvenements() {
    const container = document.getElementById("evenementList");
    if (!container) return;
    
    container.innerHTML = "";

    if (evenements.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; color: #999;'>Aucun événement créé</p>";
        return;
    }

    evenements.forEach((e, index) => {
        container.innerHTML += `
            <div class="card">
                <h3>🎉 ${e.nom}</h3>
                <p>${e.desc}</p>
                <p><strong>📅 Date:</strong> ${formatDate(e.date)} ${e.heure ? "à " + e.heure : ""}</p>
                <p><strong>📍 Lieu:</strong> ${e.lieu}</p>
                <p><strong>👥 Participants attendus:</strong> ${e.participants}</p>
                <div class="card-footer">
                    <button onclick="editEvenement(${index})" class="btn-edit">✏️ Éditer</button>
                    <button onclick="deleteEvenement(${index})" class="btn-delete">🗑️ Supprimer</button>
                </div>
            </div>
        `;
    });
}

function deleteEvenement(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer cet événement?")) {
        evenements.splice(index, 1);
        saveToStorage("evenements", evenements);
        displayEvenements();
        updateStatistics();
        alert("✅ Événement supprimé");
    }
}

function editEvenement(index) {
    const e = evenements[index];
    document.getElementById("nomEvenement").value = e.nom;
    document.getElementById("descEvenement").value = e.desc;
    document.getElementById("dateEvenement").value = e.date;
    document.getElementById("heureEvenement").value = e.heure;
    document.getElementById("lieuEvenement").value = e.lieu;
    document.getElementById("participantsEvenement").value = e.participants;
    deleteEvenement(index);
}

// ===== CIMETIÈRE =====
function addInhumation() {
    const nom = document.getElementById("nomDefunt").value.trim();
    const dateNaissance = document.getElementById("dateNaissance").value;
    const dateInhumation = document.getElementById("dateInhumation").value;
    const section = document.getElementById("sectionCimetiere").value.trim();
    const famille = document.getElementById("familleDefunt").value.trim();
    const remarque = document.getElementById("remarqueCimetiere").value.trim();

    if (!nom || !dateInhumation || !section || !famille) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires");
        return;
    }

    cimetiere.push({
        id: Date.now(),
        nom,
        dateNaissance,
        dateInhumation,
        section,
        famille,
        remarque
    });

    saveToStorage("cimetiere", cimetiere);
    clearInhumationForm();
    displayCimetiere();
    updateStatistics();
    alert("✅ Inhumation enregistrée");
}

function clearInhumationForm() {
    document.getElementById("nomDefunt").value = "";
    document.getElementById("dateNaissance").value = "";
    document.getElementById("dateInhumation").value = "";
    document.getElementById("sectionCimetiere").value = "";
    document.getElementById("familleDefunt").value = "";
    document.getElementById("remarqueCimetiere").value = "";
}

function displayCimetiere() {
    const tbody = document.querySelector("#cimetiereTa tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (cimetiere.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding: 20px;'>Aucune inhumation enregistrée</td></tr>";
        updateCimetierCount(0);
        return;
    }

    cimetiere.forEach((c, index) => {
        tbody.innerHTML += `<tr>
            <td><strong>${c.nom}</strong></td>
            <td>${formatDate(c.dateInhumation)}</td>
            <td>${c.section}</td>
            <td>${c.famille}</td>
            <td>${c.remarque || "-"}</td>
            <td>
                <button onclick="editInhumation(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteInhumation(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });

    updateCimetierCount(cimetiere.length);
}

function updateCimetierCount(count) {
    const countCimetiere = document.getElementById("countCimetiere");
    if (countCimetiere) countCimetiere.innerText = count;
}

function deleteInhumation(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer cette inhumation?")) {
        cimetiere.splice(index, 1);
        saveToStorage("cimetiere", cimetiere);
        displayCimetiere();
        updateStatistics();
        alert("✅ Inhumation supprimée");
    }
}

function editInhumation(index) {
    const c = cimetiere[index];
    document.getElementById("nomDefunt").value = c.nom;
    document.getElementById("dateNaissance").value = c.dateNaissance;
    document.getElementById("dateInhumation").value = c.dateInhumation;
    document.getElementById("sectionCimetiere").value = c.section;
    document.getElementById("familleDefunt").value = c.famille;
    document.getElementById("remarqueCimetiere").value = c.remarque;
    deleteInhumation(index);
}

// ===== BAPTÊMES =====
function addBapteme() {
    const nom = document.getElementById("nomBaptise").value.trim();
    const age = parseInt(document.getElementById("ageBaptise").value) || 0;
    const date = document.getElementById("dateBapteme").value;
    const parrain = document.getElementById("parrainBapteme").value.trim();
    const pastor = document.getElementById("pastorBapteme").value.trim();
    const remarque = document.getElementById("remarqueBapteme").value.trim();

    if (!nom || age < 0 || !date || !parrain || !pastor) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires avec des valeurs valides");
        return;
    }

    baptemes.push({
        id: Date.now(),
        nom,
        age,
        date,
        parrain,
        pastor,
        remarque
    });

    saveToStorage("baptemes", baptemes);
    clearBaptemeForm();
    displayBaptemes();
    updateStatistics();
    alert("✅ Baptême enregistré");
}

function clearBaptemeForm() {
    document.getElementById("nomBaptise").value = "";
    document.getElementById("ageBaptise").value = "";
    document.getElementById("dateBapteme").value = "";
    document.getElementById("parrainBapteme").value = "";
    document.getElementById("pastorBapteme").value = "";
    document.getElementById("remarqueBapteme").value = "";
}

function displayBaptemes() {
    const tbody = document.querySelector("#baptemeTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (baptemes.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center; padding: 20px;'>Aucun baptême enregistré</td></tr>";
        updateBaptemeCount(0);
        return;
    }

    baptemes.forEach((b, index) => {
        tbody.innerHTML += `<tr>
            <td><strong>${b.nom}</strong></td>
            <td>${b.age} ans</td>
            <td>${formatDate(b.date)}</td>
            <td>${b.parrain}</td>
            <td>${b.pastor}</td>
            <td>${b.remarque || "-"}</td>
            <td>
                <button onclick="editBapteme(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteBapteme(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });

    updateBaptemeCount(baptemes.length);
}

function updateBaptemeCount(count) {
    const countBapteme = document.getElementById("countBapteme");
    if (countBapteme) countBapteme.innerText = count;
}

function deleteBapteme(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer ce baptême?")) {
        baptemes.splice(index, 1);
        saveToStorage("baptemes", baptemes);
        displayBaptemes();
        updateStatistics();
        alert("✅ Baptême supprimé");
    }
}

function editBapteme(index) {
    const b = baptemes[index];
    document.getElementById("nomBaptise").value = b.nom;
    document.getElementById("ageBaptise").value = b.age;
    document.getElementById("dateBapteme").value = b.date;
    document.getElementById("parrainBapteme").value = b.parrain;
    document.getElementById("pastorBapteme").value = b.pastor;
    document.getElementById("remarqueBapteme").value = b.remarque;
    deleteBapteme(index);
}

// ===== MARIAGES =====
function addMariage() {
    const nomEpoux = document.getElementById("nomEpoux").value.trim();
    const nomEpouse = document.getElementById("nomEpouse").value.trim();
    const date = document.getElementById("dateMariage").value;
    const pastor = document.getElementById("pastorMariage").value.trim();
    const temoins = document.getElementById("temoins").value.trim();
    const remarque = document.getElementById("remarqueMariage").value.trim();

    if (!nomEpoux || !nomEpouse || !date || !pastor || !temoins) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires");
        return;
    }

    mariages.push({
        id: Date.now(),
        nomEpoux,
        nomEpouse,
        date,
        pastor,
        temoins,
        remarque
    });

    saveToStorage("mariages", mariages);
    clearMariageForm();
    displayMariages();
    updateStatistics();
    alert("✅ Mariage enregistré");
}

function clearMariageForm() {
    document.getElementById("nomEpoux").value = "";
    document.getElementById("nomEpouse").value = "";
    document.getElementById("dateMariage").value = "";
    document.getElementById("pastorMariage").value = "";
    document.getElementById("temoins").value = "";
    document.getElementById("remarqueMariage").value = "";
}

function displayMariages() {
    const tbody = document.querySelector("#mariageTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (mariages.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center; padding: 20px;'>Aucun mariage enregistré</td></tr>";
        updateMariageCount(0);
        return;
    }

    mariages.forEach((m, index) => {
        tbody.innerHTML += `<tr>
            <td><strong>${m.nomEpoux}</strong></td>
            <td><strong>${m.nomEpouse}</strong></td>
            <td>${formatDate(m.date)}</td>
            <td>${m.pastor}</td>
            <td>${m.temoins}</td>
            <td>${m.remarque || "-"}</td>
            <td>
                <button onclick="editMariage(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteMariage(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });

    updateMariageCount(mariages.length);
}

function updateMariageCount(count) {
    const countMariage = document.getElementById("countMariage");
    if (countMariage) countMariage.innerText = count;
}

function deleteMariage(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer ce mariage?")) {
        mariages.splice(index, 1);
        saveToStorage("mariages", mariages);
        displayMariages();
        updateStatistics();
        alert("✅ Mariage supprimé");
    }
}

function editMariage(index) {
    const m = mariages[index];
    document.getElementById("nomEpoux").value = m.nomEpoux;
    document.getElementById("nomEpouse").value = m.nomEpouse;
    document.getElementById("dateMariage").value = m.date;
    document.getElementById("pastorMariage").value = m.pastor;
    document.getElementById("temoins").value = m.temoins;
    document.getElementById("remarqueMariage").value = m.remarque;
    deleteMariage(index);
}

// ===== OBJETS =====
function addObjet() {
    const nom = document.getElementById("nomObjet").value.trim();
    const desc = document.getElementById("descObjet").value.trim();
    const type = document.getElementById("typeObjet").value;
    const quantite = parseInt(document.getElementById("quantiteObjet").value) || 0;
    const dateAcquisition = document.getElementById("dateAcquisitionObjet").value;

    if (!nom || !type || quantite <= 0) {
        alert("⚠️ Veuillez remplir tous les champs obligatoires avec des valeurs valides");
        return;
    }

    objets.push({
        id: Date.now(),
        nom,
        desc,
        type,
        quantite,
        dateAcquisition
    });

    saveToStorage("objets", objets);
    clearObjetForm();
    displayObjets();
    updateStatistics();
    alert("✅ Objet ajouté avec succès");
}

function clearObjetForm() {
    document.getElementById("nomObjet").value = "";
    document.getElementById("descObjet").value = "";
    document.getElementById("typeObjet").value = "";
    document.getElementById("quantiteObjet").value = "1";
    document.getElementById("dateAcquisitionObjet").value = "";
}

function displayObjets() {
    const tbody = document.querySelector("#objetTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (objets.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding: 20px;'>Aucun objet enregistré</td></tr>";
        return;
    }

    objets.forEach((o, index) => {
        tbody.innerHTML += `<tr>
            <td><strong>${o.nom}</strong></td>
            <td>${o.type}</td>
            <td>${o.desc || "-"}</td>
            <td>${o.quantite}</td>
            <td>${formatDate(o.dateAcquisition)}</td>
            <td>
                <button onclick="editObjet(${index})" class="btn-edit">✏️ Éditer</button>
                <button onclick="deleteObjet(${index})" class="btn-delete">🗑️ Supprimer</button>
            </td>
        </tr>`;
    });
}

function deleteObjet(index) {
    if (confirm("❓ Êtes-vous sûr de vouloir supprimer cet objet?")) {
        objets.splice(index, 1);
        saveToStorage("objets", objets);
        displayObjets();
        updateStatistics();
        alert("✅ Objet supprimé");
    }
}

function editObjet(index) {
    const o = objets[index];
    document.getElementById("nomObjet").value = o.nom;
    document.getElementById("descObjet").value = o.desc;
    document.getElementById("typeObjet").value = o.type;
    document.getElementById("quantiteObjet").value = o.quantite;
    document.getElementById("dateAcquisitionObjet").value = o.dateAcquisition;
    deleteObjet(index);
}

// ===== MESSAGES =====
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        messages = await response.json();
        displayMessages();
    } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
    }
}

function displayMessages() {
    const messageList = document.getElementById('messageList');
    if (!messageList) return;

    messageList.innerHTML = '';

    if (messages.length === 0) {
        messageList.innerHTML = '<p style="text-align: center; padding: 20px;">Aucun message</p>';
        return;
    }

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-item ${message.read ? 'read' : 'unread'}`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <strong>${message.subject}</strong>
                <span class="message-date">${formatDate(message.date)}</span>
            </div>
            <div class="message-meta">
                De: ${message.from} | À: ${message.to}
            </div>
            <div class="message-content">${message.content}</div>
            <div class="message-actions">
                ${!message.read ? `<button onclick="markAsRead(${message.id})" class="btn-view">Marquer comme lu</button>` : ''}
                <button onclick="deleteMessage(${message.id})" class="btn-delete">Supprimer</button>
            </div>
        `;
        messageList.appendChild(messageDiv);
    });
}

async function sendMessage() {
    const from = document.getElementById('messageFrom').value.trim();
    const to = document.getElementById('messageTo').value.trim();
    const subject = document.getElementById('messageSubject').value.trim();
    const content = document.getElementById('messageContent').value.trim();

    if (!from || !to || !subject || !content) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, subject, content })
        });

        if (response.ok) {
            alert('Message envoyé avec succès');
            closeSendMessageModal();
            loadMessages();
        } else {
            alert('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'envoi du message');
    }
}

async function markAsRead(id) {
    try {
        await fetch(`/api/messages/${id}/read`, { method: 'PUT' });
        loadMessages();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function deleteMessage(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
        try {
            await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            loadMessages();
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
}

function showSendMessageModal() {
    document.getElementById('sendMessageModal').style.display = 'block';
}

function closeSendMessageModal() {
    document.getElementById('sendMessageModal').style.display = 'none';
    document.getElementById('messageFrom').value = '';
    document.getElementById('messageTo').value = '';
    document.getElementById('messageSubject').value = '';
    document.getElementById('messageContent').value = '';
}

// ===== MEETINGS =====
async function loadMeetings() {
    try {
        const response = await fetch('/api/meetings');
        meetings = await response.json();
        displayMeetings();
    } catch (error) {
        console.error('Erreur lors du chargement des réunions:', error);
    }
}

function displayMeetings() {
    const meetingList = document.getElementById('meetingList');
    if (!meetingList) return;

    meetingList.innerHTML = '';

    if (meetings.length === 0) {
        meetingList.innerHTML = '<p style="text-align: center; padding: 20px;">Aucune réunion</p>';
        return;
    }

    meetings.forEach(meeting => {
        const meetingDiv = document.createElement('div');
        meetingDiv.className = 'meeting-item';
        meetingDiv.innerHTML = `
            <div class="meeting-header">
                <strong>${meeting.title}</strong>
                <span class="meeting-date">${formatDate(meeting.date)}</span>
            </div>
            <div class="meeting-participants">
                Participants: ${meeting.participants}
            </div>
            <div class="meeting-minutes">
                <strong>Minutes:</strong><br>
                ${meeting.minutes}
            </div>
            <div class="meeting-actions">
                <button onclick="editMeetingMinutes(${meeting.id})" class="btn-edit">Éditer minutes</button>
                <button onclick="deleteMeeting(${meeting.id})" class="btn-delete">Supprimer</button>
            </div>
        `;
        meetingList.appendChild(meetingDiv);
    });
}

async function addMeeting() {
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value;
    const participants = document.getElementById('meetingParticipants').value.trim();
    const minutes = document.getElementById('meetingMinutes').value.trim();

    if (!title || !date || !participants || !minutes) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, date, participants, minutes })
        });

        if (response.ok) {
            alert('Réunion ajoutée avec succès');
            closeAddMeetingModal();
            loadMeetings();
        } else {
            alert('Erreur lors de l\'ajout de la réunion');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de la réunion');
    }
}

async function editMeetingMinutes(id) {
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;

    const newMinutes = prompt('Éditer les minutes:', meeting.minutes);
    if (newMinutes !== null && newMinutes.trim() !== '') {
        try {
            const response = await fetch(`/api/meetings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minutes: newMinutes })
            });

            if (response.ok) {
                loadMeetings();
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
}

async function deleteMeeting(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réunion ?')) {
        try {
            await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            loadMeetings();
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
}

function showAddMeetingModal() {
    document.getElementById('addMeetingModal').style.display = 'block';
}

function closeAddMeetingModal() {
    document.getElementById('addMeetingModal').style.display = 'none';
    document.getElementById('meetingTitle').value = '';
    document.getElementById('meetingDate').value = '';
    document.getElementById('meetingParticipants').value = '';
    document.getElementById('meetingMinutes').value = '';
}

// ===== STATISTIQUES =====
function updateStatistics() {
    const totalDime = calculateTotal(dimes, "montant");
    const totalOffrande = calculateTotal(offrandes, "montant");
    const totalRevenus = totalDime + totalOffrande;
    const membresActifs = membres.filter(m => m.status === "Actif").length;

    const statTotalMembre = document.getElementById("statTotalMembre");
    if (statTotalMembre) statTotalMembre.innerText = membresActifs;
    
    const statTotalDime = document.getElementById("statTotalDime");
    if (statTotalDime) statTotalDime.innerText = formatMoney(totalDime);
    const statCountDime = document.getElementById("statCountDime");
    if (statCountDime) statCountDime.innerText = dimes.length + " entrées";
    
    const statTotalOffrande = document.getElementById("statTotalOffrande");
    if (statTotalOffrande) statTotalOffrande.innerText = formatMoney(totalOffrande);
    const statCountOffrande = document.getElementById("statCountOffrande");
    if (statCountOffrande) statCountOffrande.innerText = offrandes.length + " entrées";
    
    const statTotalRevenus = document.getElementById("statTotalRevenus");
    if (statTotalRevenus) statTotalRevenus.innerText = formatMoney(totalRevenus);
    
    const statCountGroupes = document.getElementById("statCountGroupes");
    if (statCountGroupes) statCountGroupes.innerText = groupes.length;
    const statCountEvenement = document.getElementById("statCountEvenement");
    if (statCountEvenement) statCountEvenement.innerText = evenements.length;
    const statCountCimetiere = document.getElementById("statCountCimetiere");
    if (statCountCimetiere) statCountCimetiere.innerText = cimetiere.length;
    const statCountBapteme = document.getElementById("statCountBapteme");
    if (statCountBapteme) statCountBapteme.innerText = baptemes.length;
    const statCountMariage = document.getElementById("statCountMariage");
    if (statCountMariage) statCountMariage.innerText = mariages.length;
    const statCountObjets = document.getElementById("statCountObjets");
    if (statCountObjets) statCountObjets.innerText = objets.length;
}

// ===== EXPORT / IMPORT / PRINT =====
function exportData() {
    const data = {
        membres,
        dimes,
        offrandes,
        groupes,
        plans,
        objets,
        evenements,
        cimetiere,
        baptemes,
        mariages,
        devise,
        dateExport: new Date().toLocaleString('fr-FR')
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gestion_eglise_" + new Date().getTime() + ".json";
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Données exportées avec succès");
}

function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = function(e) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                membres = data.membres || [];
                dimes = data.dimes || [];
                offrandes = data.offrandes || [];
                groupes = data.groupes || [];
                plans = data.plans || [];
                objets = data.objets || [];
                evenements = data.evenements || [];
                cimetiere = data.cimetiere || [];
                baptemes = data.baptemes || [];
                mariages = data.mariages || [];
                devise = data.devise || "USD";

                document.getElementById("deviseSelect").value = devise;
                document.getElementById("deviseActuelle").innerText = "Devise: " + devise;

                saveToStorage("membres", membres);
                saveToStorage("dimes", dimes);
                saveToStorage("offrandes", offrandes);
                saveToStorage("groupes", groupes);
                saveToStorage("plans", plans);
                saveToStorage("objets", objets);
                saveToStorage("evenements", evenements);
                saveToStorage("cimetiere", cimetiere);
                saveToStorage("baptemes", baptemes);
                saveToStorage("mariages", mariages);

                displayMembres();
                displayDimes();
                displayOffrandes();
                displayGroupes();
                displayPlans();
                displayObjets();
                displayEvenements();
                displayCimetiere();
                displayBaptemes();
                displayMariages();
                updateStatistics();

                alert("✅ Données importées avec succès");
            } catch (err) {
                alert("❌ Erreur lors de l'import: " + err.message);
            }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

function printReport() {
    window.print();
}

function clearAllData() {
    if (confirm("⚠️ ATTENTION! Cela supprimera TOUTES les données. Êtes-vous sûr?")) {
        if (confirm("Confirmer la suppression définitive de toutes les données?")) {
            membres = [];
            dimes = [];
            offrandes = [];
            groupes = [];
            plans = [];
            objets = [];
            evenements = [];
            cimetiere = [];
            baptemes = [];
            mariages = [];

            saveToStorage("membres", membres);
            saveToStorage("dimes", dimes);
            saveToStorage("offrandes", offrandes);
            saveToStorage("groupes", groupes);
            saveToStorage("plans", plans);
            saveToStorage("objets", objets);
            saveToStorage("evenements", evenements);
            saveToStorage("cimetiere", cimetiere);
            saveToStorage("baptemes", baptemes);
            saveToStorage("mariages", mariages);

            displayMembres();
            displayDimes();
            displayOffrandes();
            displayGroupes();
            displayPlans();
            displayObjets();
            displayEvenements();
            displayCimetiere();
            displayBaptemes();
            displayMariages();
            updateStatistics();

            alert("✅ Toutes les données ont été supprimées");
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function() {
    if (typeof currentUser !== 'undefined' && currentUser) {
        console.log("🔄 Initialisation de l'application...");
        
        displayMembres();
        displayDimes();
        displayOffrandes();
        displayGroupes();
        displayPlans();
        displayObjets();
        displayEvenements();
        displayCimetiere();
        displayBaptemes();
        displayMariages();
        loadMessages();
        loadMeetings();
        updateStatistics();
        
        console.log("✅ Application Gestion Église chargée avec succès");
    } else {
        console.warn("⚠️ Utilisateur non identifié");
    }
});