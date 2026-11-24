// =====================================================
// Anagrafica Enterprise V3
// backup.js
// Backup & Restore
// =====================================================

const BACKUP_VERSION = "3.0";

// =====================================================
// EXPORT BACKUP
// =====================================================

async function exportBackup() {

    try {

        if (!window.people ||
            !Array.isArray(window.people)) {

            showMessage(
                "Nessun dato disponibile",
                "error"
            );

            return;
        }

        const backup = {

            application: "Anagrafica Enterprise",

            version: BACKUP_VERSION,

            exportDate:
                new Date().toISOString(),

            totalRecords:
                window.people.length,

            data:
                window.people

        };

        const timestamp =
            new Date()
                .toISOString()
                .replace(/:/g, "-")
                .split(".")[0];

        const fileName =
            `backup-anagrafica-${timestamp}.json`;

        downloadFile(
            fileName,
            JSON.stringify(
                backup,
                null,
                2
            ),
            "application/json"
        );

        showMessage(
            "Backup completato",
            "success"
        );

        console.log(
            "[BACKUP] Creato:",
            fileName
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Errore durante il backup",
            "error"
        );

    }

}

// =====================================================
// IMPORT BACKUP
// =====================================================

async function importBackup(file) {

    try {

        if (!file)
            return;

        const text =
            await file.text();

        const backup =
            JSON.parse(text);

        validateBackup(
            backup
        );

        const confirmRestore =
            confirm(
                `Ripristinare ${backup.data.length} record?`
            );

        if (!confirmRestore)
            return;

        await replaceDatabase(
            backup.data
        );

        showMessage(
            "Ripristino completato",
            "success"
        );

        if (
            typeof loadPeople ===
            "function"
        ) {

            await loadPeople();

        }

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Backup non valido",
            "error"
        );

    }

}

// =====================================================
// VALIDAZIONE BACKUP
// =====================================================

function validateBackup(
    backup
) {

    if (!backup)
        throw new Error(
            "Backup vuoto"
        );

    if (!backup.data)
        throw new Error(
            "Sezione data mancante"
        );

    if (
        !Array.isArray(
            backup.data
        )
    ) {

        throw new Error(
            "Formato non valido"
        );

    }

    return true;

}

// =====================================================
// DATABASE REPLACE
// =====================================================

async function replaceDatabase(
    records
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!window.db) {

                reject(
                    "Database non disponibile"
                );

                return;

            }

            const transaction =
                db.transaction(
                    ["people"],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    "people"
                );

            const clearRequest =
                store.clear();

            clearRequest.onsuccess =
                () => {

                    let created = 0;

                    if (
                        records.length === 0
                    ) {

                        resolve();

                        return;

                    }

                    records.forEach(
                        person => {

                            const request =
                                store.put(
                                    person
                                );

                            request.onsuccess =
                                () => {

                                    created++;

                                    if (
                                        created ===
                                        records.length
                                    ) {

                                        resolve();

                                    }

                                };

                            request.onerror =
                                reject;

                        }

                    );

                };

            clearRequest.onerror =
                reject;

        }

    );

}

// =====================================================
// AUTO BACKUP
// =====================================================

function createAutoBackup() {

    try {

        if (
            !window.people ||
            !window.people.length
        ) {

            return;

        }

        const backup = {

            version:
                BACKUP_VERSION,

            timestamp:
                new Date()
                    .toISOString(),

            records:
                window.people

        };

        localStorage.setItem(
            "anagrafica_autobackup",
            JSON.stringify(
                backup
            )
        );

    }
    catch (error) {

        console.error(
            "AutoBackup Error",
            error
        );

    }

}

// =====================================================
// RESTORE AUTO BACKUP
// =====================================================

function getAutoBackup() {

    try {

        const backup =
            localStorage.getItem(
                "anagrafica_autobackup"
            );

        if (!backup)
            return null;

        return JSON.parse(
            backup
        );

    }
    catch {

        return null;

    }

}

// =====================================================
// DELETE AUTO BACKUP
// =====================================================

function clearAutoBackup() {

    localStorage.removeItem(
        "anagrafica_autobackup"
    );

}

// =====================================================
// EVENT HANDLERS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const backupButton =
            document.getElementById(
                "backupBtn"
            );

        const restoreButton =
            document.getElementById(
                "restoreBtn"
            );

        const restoreFile =
            document.getElementById(
                "restoreFile"
            );

        if (backupButton) {

            backupButton.addEventListener(
                "click",
                exportBackup
            );

        }

        if (restoreButton) {

            restoreButton.addEventListener(
                "click",
                () => {

                    restoreFile.click();

                }
            );

        }

        if (
            restoreFile
        ) {

            restoreFile.addEventListener(
                "change",
                async event => {

                    const file =
                        event.target
                            .files[0];

                    if (file) {

                        await importBackup(
                            file
                        );

                    }

                    restoreFile.value = "";

                }
            );

        }

    }
);

// =====================================================
// PUBLIC API
// =====================================================

window.BackupManager = {

    exportBackup,

    importBackup,

    createAutoBackup,

    getAutoBackup,

    clearAutoBackup

};