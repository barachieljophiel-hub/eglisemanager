from pathlib import Path

path = Path(r"c:\Users\kioskUser0\Desktop\smartbiz\main.js")
text = path.read_text(encoding='utf-8')
marker = '        console.log("✅ Application Gestion Église chargée avec succès");'
idx = text.find(marker)
if idx == -1:
    raise SystemExit('MARKER NOT FOUND')
end = text.find('});', idx)
if end == -1:
    raise SystemExit('CLOSING BRACE NOT FOUND')
end += 3
new_block = """

// ===== ADMIN FUNCTIONS =====
function displayAdmin() {
    let totalUsers = users.length;
    let activeLicenses = users.filter(u => u.licenseKey).length;
    let pendingRequests = getAllLicenseRequests().filter(r => r.status === "EN_ATTENTE").length;
    let totalRevenue = getAllLicenseRequests().filter(r => r.status === "APPROUVE").reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    document.getElementById("totalUsers").innerText = totalUsers;
    document.getElementById("activeLicenses").innerText = activeLicenses;
    document.getElementById("pendingRequests").innerText = pendingRequests;
    document.getElementById("totalRevenue").innerText = "$" + totalRevenue.toFixed(2);
}

function displayUsers() {
    let tbody = document.querySelector("#userTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    users.forEach((user, index) => {
        tbody.innerHTML += `<tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.egliseName}</td>
            <td>${user.role}</td>
            <td>${user.licenseKey || "Aucune"}</td>
            <td>
                <button onclick="assignLicense(${index})" class="btn-edit">Assigner licence</button>
                <button onclick="deleteUser(${index})" class="btn-delete">Supprimer</button>
            </td>
        </tr>`;
    });
}

function assignLicense(userIndex) {
    let licenseKey = prompt("Entrez la clé de licence :");
    if (licenseKey) {
        users[userIndex].licenseKey = licenseKey;
        localStorage.setItem("users", JSON.stringify(users));
        displayUsers();
        alert("✅ Licence assignée");
    }
}

function deleteUser(index) {
    if (confirm("Supprimer cet utilisateur ?")) {
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        displayUsers();
    }
}

function displayLicenses() {
    let tbody = document.querySelector("#licenseTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    getAllLicenseRequests().forEach((request) => {
        tbody.innerHTML += `<tr>
            <td>${request.licenseKey || "Non générée"}</td>
            <td>${request.email}</td>
            <td>${request.churchName}</td>
            <td>${request.status}</td>
            <td>
                ${request.status === "EN_ATTENTE" ? `<button onclick="approveLicenseRequest('${request.id}')" class="btn-edit">Approuver</button>` : ""}
                <button onclick="deleteLicenseRequest('${request.id}')" class="btn-delete">Supprimer</button>
            </td>
        </tr>`;
    });
}

function deleteLicenseRequest(requestId) {
    if (confirm("Supprimer cette demande de licence ?")) {
        let requests = getAllLicenseRequests().filter(r => r.id !== requestId);
        saveAllLicenseRequests(requests);
        displayLicenses();
    }
}
"""

new_text = text[:end] + new_block
path.write_text(new_text, encoding='utf-8')
print('UPDATED')
