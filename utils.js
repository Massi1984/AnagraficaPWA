// =====================================================
// Anagrafica Enterprise V3
// utils.js
// Funzioni comuni
// =====================================================

// =====================================================
// COSTANTI
// =====================================================

const APP_NAME = "Anagrafica Enterprise";
const APP_VERSION = "3.0";

// =====================================================
// GENERIC HELPERS
// =====================================================

function generateId() {

    return crypto.randomUUID();

}

function isNullOrEmpty(value) {

    return value === null ||
        value === undefined ||
        String(value).trim() === "";

}

function sanitize(value) {

    if (value === null || value === undefined)
        return "";

    return String(value).trim();

}

// =====================================================
// DATE
// =====================================================

function calculateAge(birthDate) {

    if (!birthDate)
        return null;

    const today = new Date();

    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff =
        today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (
            monthDiff === 0 &&
            today.getDate() < birth.getDate()
        )
    ) {

        age--;

    }

    return age;

}

function formatDate(dateString) {

    if (!dateString)
        return "";

    try {

        const date = new Date(dateString);

        return date.toLocaleDateString(
            "it-IT"
        );

    }
    catch {

        return dateString;

    }

}

// =====================================================
// EMAIL
// =====================================================

function isValidEmail(email) {

    if (!email)
        return true;

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

}

// =====================================================
// TELEFONO
// =====================================================

function isValidPhone(phone) {

    if (!phone)
        return true;

    const regex =
        /^[0-9+\s\-()]{5,20}$/;

    return regex.test(phone);

}

// =====================================================
// CODICE FISCALE
// =====================================================

// Validazione formato italiano

function isValidFiscalCode(cf) {

    if (!cf)
        return true;

    cf = cf.toUpperCase().trim();

    const regex =
        /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

    return regex.test(cf);

}

// =====================================================
// IMAGE
// =====================================================

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () =>
            resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}

function createPhotoPreview(
    imageData,
    targetElement
) {

    if (!targetElement)
        return;

    if (!imageData) {

        targetElement.innerHTML =
            "<span>Nessuna foto selezionata</span>";

        return;

    }

    targetElement.innerHTML = `
        <img
            src="${imageData}"
            alt="Foto Profilo">
    `;

}

// =====================================================
// STORAGE
// =====================================================

function saveTheme(theme) {

    localStorage.setItem(
        "theme",
        theme
    );

}

function getTheme() {

    return (
        localStorage.getItem("theme")
        || "light"
    );

}

// =====================================================
// DARK MODE
// =====================================================

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }
    else {

        document.body.classList.remove(
            "dark"
        );

    }

    saveTheme(theme);

}

function toggleTheme() {

    const currentTheme = getTheme();

    const newTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    applyTheme(newTheme);

}

// =====================================================
// KPI
// =====================================================

function calculateStatistics(records) {

    const stats = {

        totalPeople: records.length,

        totalCompanies: 0,

        totalEmails: 0,

        totalPhones: 0,

        totalPhotos: 0,

        averageAge: "-"

    };

    const companies = new Set();

    let ageSum = 0;

    let ageCount = 0;

    records.forEach(person => {

        if (person.azienda)
            companies.add(person.azienda);

        if (person.email)
            stats.totalEmails++;

        if (person.telefono)
            stats.totalPhones++;

        if (person.foto)
            stats.totalPhotos++;

        if (person.dataNascita) {

            const age =
                calculateAge(
                    person.dataNascita
                );

            if (age !== null) {

                ageSum += age;
                ageCount++;

            }

        }

    });

    stats.totalCompanies =
        companies.size;

    if (ageCount > 0) {

        stats.averageAge =
            Math.round(
                ageSum / ageCount
            );

    }

    return stats;

}

// =====================================================
// NOTIFICATION
// =====================================================

function showMessage(
    message,
    type = "info"
) {

    let oldMessage =
        document.getElementById(
            "appNotification"
        );

    if (oldMessage)
        oldMessage.remove();

    const notification =
        document.createElement("div");

    notification.id =
        "appNotification";

    notification.innerText =
        message;

    notification.style.position =
        "fixed";

    notification.style.top =
        "20px";

    notification.style.right =
        "20px";

    notification.style.zIndex =
        "99999";

    notification.style.padding =
        "14px 20px";

    notification.style.borderRadius =
        "10px";

    notification.style.color =
        "white";

    notification.style.fontWeight =
        "bold";

    notification.style.boxShadow =
        "0 4px 10px rgba(0,0,0,.2)";

    switch (type) {

        case "success":

            notification.style.background =
                "#107c10";

            break;

        case "error":

            notification.style.background =
                "#d13438";

            break;

        default:

            notification.style.background =
                "#0078d4";

    }

    document.body.appendChild(
        notification
    );

    setTimeout(() => {

        notification.remove();

    }, 3000);

}

// =====================================================
// DOWNLOAD FILE
// =====================================================

function downloadFile(
    fileName,
    content,
    mimeType
) {

    const blob = new Blob(
        [content],
        { type: mimeType }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

// =====================================================
// CONFIRM DIALOG
// =====================================================

function confirmDelete(message) {

    return window.confirm(
        message ||
        "Confermare eliminazione?"
    );

}

// =====================================================
// LOGGING
// =====================================================

function logInfo(message) {

    console.log(
        `[INFO] ${message}`
    );

}

function logError(message, err) {

    console.error(
        `[ERROR] ${message}`,
        err
    );

}

// =====================================================
// STARTUP
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyTheme(
            getTheme()
        );

        logInfo(
            `${APP_NAME} ${APP_VERSION} avviata`
        );

    }
);