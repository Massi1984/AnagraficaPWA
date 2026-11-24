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

// =====================================================
// CRUD
// PARTE 2
// =====================================================

// =====================================================
// REGISTER ACTION BUTTONS
// =====================================================

function registerCrudEvents() {

    const saveBtn =
        document.getElementById("saveBtn");

    const newBtn =
        document.getElementById("newBtn");

    const photoInput =
        document.getElementById("foto");

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            saveCurrentPerson
        );

    }

    if (newBtn) {

        newBtn.addEventListener(
            "click",
            clearForm
        );

    }

    if (photoInput) {

        photoInput.addEventListener(
            "change",
            previewPhoto
        );

    }

    registerSearchEvents();

}

// =====================================================
// EXTEND INIT
// =====================================================

const originalInit =
    initializeApplication;

initializeApplication =
async function () {

    await originalInit();

    registerCrudEvents();

};

// =====================================================
// READ FORM
// =====================================================

function getFormData() {

    return {

        id:
            document.getElementById(
                "recordId"
            ).value || null,

        nome:
            document.getElementById(
                "nome"
            ).value.trim(),

        cognome:
            document.getElementById(
                "cognome"
            ).value.trim(),

        dataNascita:
            document.getElementById(
                "dataNascita"
            ).value,

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        telefono:
            document.getElementById(
                "telefono"
            ).value.trim(),

        codiceFiscale:
            document.getElementById(
                "codiceFiscale"
            ).value.trim(),

        azienda:
            document.getElementById(
                "azienda"
            ).value.trim(),

        citta:
            document.getElementById(
                "citta"
            ).value.trim(),

        indirizzo:
            document.getElementById(
                "indirizzo"
            ).value.trim(),

        note:
            document.getElementById(
                "note"
            ).value.trim(),

        foto:
            window.currentPhoto || null

    };

}

// =====================================================
// VALIDATION
// =====================================================

function validatePerson(person) {

    if (!person.nome) {

        showMessage(
            "Nome obbligatorio",
            "error"
        );

        return false;

    }

    if (!person.cognome) {

        showMessage(
            "Cognome obbligatorio",
            "error"
        );

        return false;

    }

    if (
        person.email &&
        !isValidEmail(
            person.email
        )
    ) {

        showMessage(
            "Email non valida",
            "error"
        );

        return false;

    }

    if (
        person.telefono &&
        !isValidPhone(
            person.telefono
        )
    ) {

        showMessage(
            "Telefono non valido",
            "error"
        );

        return false;

    }

    return true;

}

// =====================================================
// SAVE
// =====================================================

async function saveCurrentPerson() {

    try {

        const person =
            getFormData();

        if (
            !validatePerson(
                person
            )
        ) {

            return;

        }

        await Database.savePerson(
            person
        );

        showMessage(
            "Record salvato",
            "success"
        );

        createAutoBackup();

        await refreshUI();

        clearForm();

    }
    catch (error) {

        console.error(
            error
        );

        showMessage(
            "Errore salvataggio",
            "error"
        );

    }

}

// =====================================================
// NEW
// =====================================================

function clearForm() {

    document.getElementById(
        "recordId"
    ).value = "";

    document.getElementById(
        "nome"
    ).value = "";

    document.getElementById(
        "cognome"
    ).value = "";

    document.getElementById(
        "dataNascita"
    ).value = "";

    document.getElementById(
        "email"
    ).value = "";

    document.getElementById(
        "telefono"
    ).value = "";

    document.getElementById(
        "codiceFiscale"
    ).value = "";

    document.getElementById(
        "azienda"
    ).value = "";

    document.getElementById(
        "citta"
    ).value = "";

    document.getElementById(
        "indirizzo"
    ).value = "";

    document.getElementById(
        "note"
    ).value = "";

    window.currentPhoto =
        null;

    createPhotoPreview(
        null,
        document.getElementById(
            "photoPreview"
        )
    );

}

// =====================================================
// PHOTO
// =====================================================

async function previewPhoto(
    event
) {

    const file =
        event.target.files[0];

    if (!file)
        return;

    try {

        const base64 =
            await fileToBase64(
                file
            );

        window.currentPhoto =
            base64;

        createPhotoPreview(
            base64,
            document.getElementById(
                "photoPreview"
            )
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}

// =====================================================
// TABLE ACTIONS
// =====================================================

document.addEventListener(
    "click",
    async event => {

        const editId =
            event.target.dataset.id;

        const deleteId =
            event.target.dataset.delete;

        const copyId =
            event.target.dataset.copy;

        if (editId) {

            await editPerson(
                editId
            );

        }

        if (deleteId) {

            await deletePersonUI(
                deleteId
            );

        }

        if (copyId) {

            await duplicatePerson(
                copyId
            );

        }

    }
);

// =====================================================
// EDIT
// =====================================================

async function editPerson(
    id
) {

    const person =
        await Database.getPerson(
            id
        );

    if (!person)
        return;

    document.getElementById(
        "recordId"
    ).value =
        person.id || "";

    document.getElementById(
        "nome"
    ).value =
        person.nome || "";

    document.getElementById(
        "cognome"
    ).value =
        person.cognome || "";

    document.getElementById(
        "dataNascita"
    ).value =
        person.dataNascita || "";

    document.getElementById(
        "email"
    ).value =
        person.email || "";

    document.getElementById(
        "telefono"
    ).value =
        person.telefono || "";

    document.getElementById(
        "codiceFiscale"
    ).value =
        person.codiceFiscale || "";

    document.getElementById(
        "azienda"
    ).value =
        person.azienda || "";

    document.getElementById(
        "citta"
    ).value =
        person.citta || "";

    document.getElementById(
        "indirizzo"
    ).value =
        person.indirizzo || "";

    document.getElementById(
        "note"
    ).value =
        person.note || "";

    window.currentPhoto =
        person.foto || null;

    createPhotoPreview(
        person.foto,
        document.getElementById(
            "photoPreview"
        )
    );

}

// =====================================================
// DELETE
// =====================================================

async function deletePersonUI(
    id
) {

    if (
        !confirmDelete(
            "Eliminare il record?"
        )
    ) {

        return;

    }

    await Database.deletePerson(
        id
    );

    createAutoBackup();

    await refreshUI();

    showMessage(
        "Record eliminato",
        "success"
    );

}

// =====================================================
// DUPLICATE
// =====================================================

async function duplicatePerson(
    id
) {

    const person =
        await Database.getPerson(
            id
        );

    if (!person)
        return;

    delete person.id;

    await Database.savePerson(
        person
    );

    await refreshUI();

    showMessage(
        "Record duplicato",
        "success"
    );

}

// =====================================================
// SEARCH
// =====================================================

function registerSearchEvents() {

    const controls = [

        "searchNome",
        "searchCognome",
        "searchAzienda",
        "searchCitta",
        "searchEmail",
        "searchFoto"

    ];

    controls.forEach(id => {

        const element =
            document.getElementById(
                id
            );

        if (!element)
            return;

        element.addEventListener(
            "input",
            applyFilters
        );

        element.addEventListener(
            "change",
            applyFilters
        );

    });

}

// =====================================================
// FILTERS
// =====================================================

function applyFilters() {

    const nome =
        document.getElementById(
            "searchNome"
        ).value.toLowerCase();

    const cognome =
        document.getElementById(
            "searchCognome"
        ).value.toLowerCase();

    const azienda =
        document.getElementById(
            "searchAzienda"
        ).value.toLowerCase();

    const citta =
        document.getElementById(
            "searchCitta"
        ).value.toLowerCase();

    const email =
        document.getElementById(
            "searchEmail"
        ).value.toLowerCase();

    const foto =
        document.getElementById(
            "searchFoto"
        ).value;

    window.filteredPeople =
        window.people.filter(
            person => {

                const hasPhoto =
                    !!person.foto;

                return (

                    (!nome ||
                        person.nome?.toLowerCase().includes(nome))

                    &&

                    (!cognome ||
                        person.cognome?.toLowerCase().includes(cognome))

                    &&

                    (!azienda ||
                        person.azienda?.toLowerCase().includes(azienda))

                    &&

                    (!citta ||
                        person.citta?.toLowerCase().includes(citta))

                    &&

                    (!email ||
                        person.email?.toLowerCase().includes(email))

                    &&

                    (
                        !foto ||

                        (foto === "yes" && hasPhoto) ||

                        (foto === "no" && !hasPhoto)
                    )

                );

            }
        );

    updateDashboard();

    renderTable();

}