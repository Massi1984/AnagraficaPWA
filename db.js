// =====================================================
// Anagrafica Enterprise V3
// db.js
// Data Layer - IndexedDB
// =====================================================

const DB_NAME = "AnagraficaEnterpriseDB";
const DB_VERSION = 1;
const STORE_NAME = "people";

let db = null;

// =====================================================
// OPEN DATABASE
// =====================================================

async function openDatabase() {

    return new Promise((resolve, reject) => {

        if (db) {

            resolve(db);
            return;

        }

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

        request.onerror = event => {

            console.error(
                "IndexedDB Error",
                event
            );

            reject(
                "Errore apertura database"
            );

        };

        request.onupgradeneeded =
            event => {

                const database =
                    event.target.result;

                if (
                    !database.objectStoreNames.contains(
                        STORE_NAME
                    )
                ) {

                    const store =
                        database.createObjectStore(
                            STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );

                    // Indici

                    store.createIndex(
                        "nome",
                        "nome",
                        {
                            unique: false
                        }
                    );

                    store.createIndex(
                        "cognome",
                        "cognome",
                        {
                            unique: false
                        }
                    );

                    store.createIndex(
                        "azienda",
                        "azienda",
                        {
                            unique: false
                        }
                    );

                    store.createIndex(
                        "email",
                        "email",
                        {
                            unique: false
                        }
                    );

                }

            };

        request.onsuccess =
            event => {

                db =
                    event.target.result;

                console.log(
                    "Database aperto"
                );

                window.db = db;

                resolve(db);

            };

    });

}

// =====================================================
// GENERIC TRANSACTION
// =====================================================

async function getStore(
    mode = "readonly"
) {

    const database =
        await openDatabase();

    return database
        .transaction(
            STORE_NAME,
            mode
        )
        .objectStore(
            STORE_NAME
        );

}

// =====================================================
// CREATE
// =====================================================

async function addPerson(person) {

    return new Promise(
        async (
            resolve,
            reject
        ) => {

            try {

                if (!person.id) {

                    person.id =
                        crypto.randomUUID();

                }

                person.createdAt =
                    new Date()
                        .toISOString();

                const store =
                    await getStore(
                        "readwrite"
                    );

                const request =
                    store.add(
                        person
                    );

                request.onsuccess =
                    () => {

                        resolve(
                            person
                        );

                    };

                request.onerror =
                    reject;

            }
            catch (error) {

                reject(error);

            }

        }

    );

}

// =====================================================
// UPDATE
// =====================================================

async function updatePerson(
    person
) {

    return new Promise(
        async (
            resolve,
            reject
        ) => {

            try {

                person.updatedAt =
                    new Date()
                        .toISOString();

                const store =
                    await getStore(
                        "readwrite"
                    );

                const request =
                    store.put(
                        person
                    );

                request.onsuccess =
                    () => {

                        resolve(
                            person
                        );

                    };

                request.onerror =
                    reject;

            }
            catch (error) {

                reject(error);

            }

        }

    );

}

// =====================================================
// UPSERT
// =====================================================

async function savePerson(
    person
) {

    if (!person.id) {

        return addPerson(
            person
        );

    }

    return updatePerson(
        person
    );

}

// =====================================================
// DELETE
// =====================================================

async function deletePerson(
    id
) {

    return new Promise(
        async (
            resolve,
            reject
        ) => {

            try {

                const store =
                    await getStore(
                        "readwrite"
                    );

                const request =
                    store.delete(
                        id
                    );

                request.onsuccess =
                    () => {

                        resolve();

                    };

                request.onerror =
                    reject;

            }
            catch (error) {

                reject(error);

            }

        }

    );

}

// =====================================================
// READ SINGLE
// =====================================================

async function getPerson(
    id
) {

    return new Promise(
        async (
            resolve,
            reject
        ) => {

            try {

                const store =
                    await getStore();

                const request =
                    store.get(id);

                request.onsuccess =
                    () => {

                        resolve(
                            request.result
                        );

                    };

                request.onerror =
                    reject;

            }
            catch (error) {

                reject(error);

            }

        }

    );

}

// =====================================================
// READ ALL
// =====================================================

async function getAllPeople() {

    return new Promise(
        async (
            resolve,
            reject
        ) => {

            try {

                const store =
                    await getStore();

                const request =
                    store.getAll();

                request.onsuccess =
                    () => {

                        resolve(
                            request.result ||
                            []
                        );

                    };

                request.onerror =
                    reject;

            }
            catch (error) {

                reject(error);

            }

        }

    );

}

// =====================================================
// SEARCH
// =====================================================

async function searchPeople(
    filters = {}
) {

    const people =
        await getAllPeople();

    return people.filter(
        person => {

            const matchNome =
                !filters.nome ||
                person.nome
                    ?.toLowerCase()
                    .includes(
                        filters.nome
                            .toLowerCase()
                    );

            const matchCognome =
                !filters.cognome ||
                person.cognome
                    ?.toLowerCase()
                    .includes(
                        filters.cognome
                            .toLowerCase()
                    );

            const matchAzienda =
                !filters.azienda ||
                person.azienda
                    ?.toLowerCase()
                    .includes(
                        filters.azienda
                            .toLowerCase()
                    );

            const matchCitta =
                !filters.citta ||
                person.citta
                    ?.toLowerCase()
                    .includes(
                        filters.citta
                            .toLowerCase()
                    );

            return (
                matchNome &&
                matchCognome &&
                matchAzienda &&
                matchCitta
            );

        }
    );

}

// =====================================================
// CLEAR DATABASE
// =====================================================

async function clearDatabase() {

    return new Promise(
        async (
            resolve,
            reject
        ) => {

            try {

                const store =
                    await getStore(
                        "readwrite"
                    );

                const request =
                    store.clear();

                request.onsuccess =
                    resolve;

                request.onerror =
                    reject;

            }
            catch (error) {

                reject(error);

            }

        }

    );

}

// =====================================================
// DATABASE INFO
// =====================================================

async function getDatabaseStats() {

    const people =
        await getAllPeople();

    return {

        totalRecords:
            people.length,

        database:
            DB_NAME,

        store:
            STORE_NAME,

        version:
            DB_VERSION

    };

}

// =====================================================
// INIT
// =====================================================

async function initializeDatabase() {

    try {

        await openDatabase();

        console.log(
            "Database inizializzato"
        );

    }
    catch (error) {

        console.error(
            error
        );

        throw error;

    }

}

// =====================================================
// PUBLIC API
// =====================================================

window.Database = {

    initializeDatabase,

    openDatabase,

    addPerson,

    updatePerson,

    savePerson,

    deletePerson,

    getPerson,

    getAllPeople,

    searchPeople,

    clearDatabase,

    getDatabaseStats

};

// =====================================================
// AUTO START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await initializeDatabase();

        }
        catch (error) {

            console.error(
                "Database startup failed",
                error
            );

        }

    }
);