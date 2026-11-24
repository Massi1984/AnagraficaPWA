// ================================
// CONFIGURAZIONE
// ================================

const DB_NAME = "AnagraficaDB";
const DB_VERSION = 1;
const STORE_NAME = "persone";

let db;
let currentSortField = "nome";
let currentSortDirection = "asc";

// ================================
// AVVIO APPLICAZIONE
// ================================

document.addEventListener("DOMContentLoaded", () => {

    initTheme();

    openDatabase();

    registerServiceWorker();

    document
        .getElementById("toggleTheme")
        .addEventListener("click", toggleTheme);

    document
        .getElementById("personForm")
        .addEventListener("submit", savePerson);

    [
        "searchNome",
        "searchCognome",
        "searchAzienda"
    ].forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.addEventListener("keyup", loadPeople);
        }

    });

});

// ================================
// THEME
// ================================

function initTheme() {

    const theme =
        localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

}

function toggleTheme() {

    const currentTheme =
        document.documentElement.getAttribute(
            "data-theme"
        );

    const newTheme =
        currentTheme === "dark"
        ? "light"
        : "dark";

    document.documentElement.setAttribute(
        "data-theme",
        newTheme
    );

    localStorage.setItem(
        "theme",
        newTheme
    );

}

// ================================
// DATABASE
// ================================

function openDatabase() {

    const request =
        indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

    request.onerror = () => {

        alert(
            "Errore apertura database"
        );

    };

    request.onupgradeneeded = (event) => {

        db = event.target.result;

        if (
            !db.objectStoreNames.contains(
                STORE_NAME
            )
        ) {

            db.createObjectStore(
                STORE_NAME,
                {
                    keyPath: "id",
                    autoIncrement: true
                }
            );
        }

    };

    request.onsuccess = (event) => {

        db = event.target.result;

        loadPeople();

    };

}

// ================================
// SALVATAGGIO
// ================================

function savePerson(event) {

    event.preventDefault();

    const cf =
        document
        .getElementById(
            "codiceFiscale"
        )
        .value
        .trim()
        .toUpperCase();

    if (
        cf &&
        !validateCF(cf)
    ) {

        alert(
            "Codice fiscale non valido."
        );

        return;
    }

    const photoInput =
        document.getElementById(
            "foto"
        );

    const file =
        photoInput.files[0];

    if (file) {

        const reader =
            new FileReader();

        reader.onload = () => {

            saveRecord(
                reader.result
            );

        };

        reader.readAsDataURL(
            file
        );

    }
    else {

        saveRecord(null);

    }

}

// ================================
// SALVATAGGIO RECORD
// ================================

function saveRecord(photoData) {

    const transaction =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );

    const store =
        transaction.objectStore(
            STORE_NAME
        );

    const person = {

        nome:
            document
            .getElementById("nome")
            .value
            .trim(),

        cognome:
            document
            .getElementById("cognome")
            .value
            .trim(),

        dataNascita:
            document
            .getElementById("dataNascita")
            .value,

        email:
            document
            .getElementById("email")
            .value
            .trim(),

        telefono:
            document
            .getElementById("telefono")
            .value
            .trim(),

        azienda:
            document
            .getElementById("azienda")
            .value
            .trim(),

        indirizzo:
            document
            .getElementById("indirizzo")
            .value
            .trim(),

        citta:
            document
            .getElementById("citta")
            .value
            .trim(),

        codiceFiscale:
            document
            .getElementById(
                "codiceFiscale"
            )
            .value
            .trim()
            .toUpperCase(),

        note:
            document
            .getElementById("note")
            .value
            .trim(),

        photo: photoData,

        modified:
            new Date()
            .toISOString()
    };

    const editId =
        document
        .getElementById(
            "personForm"
        )
        .dataset
        .editId;

    if (editId) {

        person.id =
            Number(editId);

    }

    store.put(person);

    transaction.oncomplete = () => {

        document
            .getElementById(
                "personForm"
            )
            .reset();

        delete document
            .getElementById(
                "personForm"
            )
            .dataset
            .editId;

        loadPeople();

    };

}

// ================================
// LETTURA RECORD
// ================================

function loadPeople() {

    const transaction =
        db.transaction(
            STORE_NAME,
            "readonly"
        );

    const store =
        transaction.objectStore(
            STORE_NAME
        );

    const request =
        store.getAll();

    request.onsuccess = () => {

        let data =
            request.result;

        data =
            applyFilters(
                data
            );

        data =
            applySorting(
                data
            );

        renderTable(
            data
        );

        updateDashboard(
            data
        );

    };

}

// ================================
// FILTRI
// ================================

function applyFilters(data) {

    const nome =
        document
        .getElementById(
            "searchNome"
        )
        ?.value
        .toLowerCase() || "";

    const cognome =
        document
        .getElementById(
            "searchCognome"
        )
        ?.value
        .toLowerCase() || "";

    const azienda =
        document
        .getElementById(
            "searchAzienda"
        )
        ?.value
        .toLowerCase() || "";

    return data.filter(p =>

        p.nome
        .toLowerCase()
        .includes(nome)

        &&

        p.cognome
        .toLowerCase()
        .includes(cognome)

        &&

        (p.azienda || "")
        .toLowerCase()
        .includes(azienda)

    );

}

// ================================
// ORDINAMENTO
// ================================

function sortTable(field) {

    if (
        currentSortField === field
    ) {

        currentSortDirection =
            currentSortDirection === "asc"
            ? "desc"
            : "asc";

    }
    else {

        currentSortField =
            field;

        currentSortDirection =
            "asc";

    }

    loadPeople();

}

function applySorting(data) {

    return data.sort((a, b) => {

        const first =
            (a[currentSortField] || "")
            .toString();

        const second =
            (b[currentSortField] || "")
            .toString();

        return currentSortDirection === "asc"

            ? first.localeCompare(second)

            : second.localeCompare(first);

    });

}

// ================================
// TABELLA
// ================================

function renderTable(data) {

    const tbody =
        document.getElementById(
            "tableBody"
        );

    tbody.innerHTML = "";

    data.forEach(person => {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `

        <td>${person.nome}</td>

        <td>${person.cognome}</td>

        <td>${person.azienda || ""}</td>

        <td>${person.email || ""}</td>

        <td>

            <button
                onclick="editPerson(${person.id})">
                Modifica
            </button>

            <button
                onclick="deletePerson(${person.id})">
                Elimina
            </button>

        </td>

        `;

        tbody.appendChild(
            row
        );

    });

}

// ================================
// MODIFICA
// ================================

function editPerson(id) {

    const transaction =
        db.transaction(
            STORE_NAME,
            "readonly"
        );

    const store =
        transaction.objectStore(
            STORE_NAME
        );

    const request =
        store.get(id);

    request.onsuccess = () => {

        const p =
            request.result;

        document
            .getElementById(
                "nome"
            )
            .value = p.nome;

        document
            .getElementById(
                "cognome"
            )
            .value = p.cognome;

        document
            .getElementById(
                "dataNascita"
            )
            .value = p.dataNascita;

        document
            .getElementById(
                "email"
            )
            .value = p.email;

        document
            .getElementById(
                "telefono"
            )
            .value = p.telefono;

        document
            .getElementById(
                "azienda"
            )
            .value = p.azienda;

        document
            .getElementById(
                "indirizzo"
            )
            .value = p.indirizzo;

        document
            .getElementById(
                "citta"
            )
            .value = p.citta;

        document
            .getElementById(
                "codiceFiscale"
            )
            .value =
            p.codiceFiscale;

        document
            .getElementById(
                "note"
            )
            .value = p.note;

        document
            .getElementById(
                "personForm"
            )
            .dataset
            .editId = p.id;

    };

}

// ================================
// CANCELLAZIONE
// ================================

function deletePerson(id) {

    if (
        !confirm(
            "Confermi eliminazione?"
        )
    ) {
        return;
    }

    const transaction =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );

    const store =
        transaction.objectStore(
            STORE_NAME
        );

    store.delete(id);

    transaction.oncomplete =
        loadPeople;

}

// ================================
// DASHBOARD
// ================================

function updateDashboard(data) {

    const stats =
        document
        .getElementById(
            "stats"
        );

    if (!stats) return;

    const aziende =
        new Set(
            data
            .map(
                p => p.azienda
            )
            .filter(Boolean)
        );

    const conEmail =
        data.filter(
            p => p.email
        ).length;

    const conTelefono =
        data.filter(
            p => p.telefono
        ).length;

    stats.innerHTML = `

        <p>
        Totale Persone:
        <b>${data.length}</b>
        </p>

        <p>
        Aziende Distinte:
        <b>${aziende.size}</b>
        </p>

        <p>
        Con Email:
        <b>${conEmail}</b>
        </p>

        <p>
        Con Telefono:
        <b>${conTelefono}</b>
        </p>

    `;

}

// ================================
// VALIDAZIONE CF
// ================================

function validateCF(cf) {

    const regex =
        /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

    return regex.test(cf);

}

// ================================
// SERVICE WORKER
// ================================

function registerServiceWorker() {

    if (
        "serviceWorker"
        in navigator
    ) {

        navigator.serviceWorker
        .register(
            "./service-worker.js"
        )
        .catch(console.error);

    }

}