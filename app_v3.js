// =====================================================
// Anagrafica Enterprise V3
// app.js - Parte 1
// Startup + Dashboard + Table
// =====================================================

// =====================================================
// GLOBAL STATE
// =====================================================

window.people = [];

window.filteredPeople = [];

let currentSortField = "cognome";

let currentSortDirection = "asc";

// =====================================================
// STARTUP
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await initializeApplication();

        }
        catch (error) {

            console.error(error);

            showMessage(
                "Errore avvio applicazione",
                "error"
            );

        }

    }
);

// =====================================================
// APPLICATION INIT
// =====================================================

async function initializeApplication() {

    console.log(
        "Anagrafica Enterprise V3 Startup"
    );

    await Database.initializeDatabase();

    registerEvents();

    await loadPeople();

    updateDashboard();

    renderTable();

    showMessage(
        "Applicazione pronta",
        "success"
    );

}

// =====================================================
// EVENTS
// =====================================================

function registerEvents() {

    // Dark Mode

    const themeButton =
        document.getElementById(
            "toggleTheme"
        );

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            toggleTheme
        );

    }

    // Sort Header

    document
        .querySelectorAll(
            "th[data-sort]"
        )
        .forEach(
            header => {

                header.addEventListener(
                    "click",
                    () => {

                        const field =
                            header.dataset.sort;

                        sortTable(field);

                    }
                );

            }
        );

}

// =====================================================
// LOAD PEOPLE
// =====================================================

async function loadPeople() {

    try {

        const records =
            await Database.getAllPeople();

        window.people =
            records || [];

        window.filteredPeople =
            [...window.people];

        console.log(
            `Caricati ${records.length} record`
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Errore caricamento dati",
            "error"
        );

    }

}

// =====================================================
// REFRESH UI
// =====================================================

async function refreshUI() {

    await loadPeople();

    updateDashboard();

    renderTable();

}

// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const stats =
        calculateStatistics(
            window.filteredPeople
        );

    setText(
        "totalPeople",
        stats.totalPeople
    );

    setText(
        "totalCompanies",
        stats.totalCompanies
    );

    setText(
        "totalEmails",
        stats.totalEmails
    );

    setText(
        "totalPhones",
        stats.totalPhones
    );

    setText(
        "totalPhotos",
        stats.totalPhotos
    );

    setText(
        "averageAge",
        stats.averageAge
    );

    setText(
        "recordCount",
        `${stats.totalPeople} Record`
    );

}

// =====================================================
// TABLE
// =====================================================

function renderTable() {

    const tbody =
        document.getElementById(
            "peopleTable"
        );

    if (!tbody)
        return;

    tbody.innerHTML = "";

    if (
        window.filteredPeople.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    Nessun record trovato
                </td>
            </tr>
        `;

        return;

    }

    window.filteredPeople.forEach(
        person => {

            const row =
                createTableRow(
                    person
                );

            tbody.appendChild(
                row
            );

        }
    );

}

// =====================================================
// TABLE ROW
// =====================================================

function createTableRow(
    person
) {

    const row =
        document.createElement(
            "tr"
        );

    row.innerHTML = `

        <td>

            ${
                person.foto

                ?

                `<img
                    src="${person.foto}"
                    class="table-photo">`

                :

                "📷"
            }

        </td>

        <td>
            ${person.nome || ""}
        </td>

        <td>
            ${person.cognome || ""}
        </td>

        <td>
            ${person.azienda || ""}
        </td>

        <td>
            ${person.citta || ""}
        </td>

        <td>
            ${person.email || ""}
        </td>

        <td>
            ${person.telefono || ""}
        </td>

        <td>

            <div class="action-buttons">

                <button
                    class="btn btn-edit"
                    data-id="${person.id}">

                    ✏️

                </button>

                <button
                    class="btn btn-copy"
                    data-copy="${person.id}">

                    📄

                </button>

                <button
                    class="btn btn-delete"
                    data-delete="${person.id}">

                    🗑️

                </button>

            </div>

        </td>

    `;

    return row;

}

// =====================================================
// SORT
// =====================================================

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

    window.filteredPeople.sort(
        (a, b) => {

            const valueA =
                (a[field] || "")
                    .toString()
                    .toLowerCase();

            const valueB =
                (b[field] || "")
                    .toString()
                    .toLowerCase();

            if (
                currentSortDirection === "asc"
            ) {

                return valueA.localeCompare(
                    valueB
                );

            }

            return valueB.localeCompare(
                valueA
            );

        }
    );

    renderTable();

}

// =====================================================
// HELPERS
// =====================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            value;

    }

}

// =====================================================
// DEBUG
// =====================================================

window.App = {

    refreshUI,

    loadPeople,

    renderTable,

    updateDashboard

};