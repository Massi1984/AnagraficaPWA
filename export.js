// =====================================================
// Anagrafica Enterprise V3
// export.js
// Export Excel & PDF
// =====================================================

// =====================================================
// DATA NORMALIZATION
// =====================================================

function getExportData() {

    if (
        !window.people ||
        !Array.isArray(window.people)
    ) {

        return [];

    }

    return window.people.map(person => ({

        Nome: person.nome || "",

        Cognome: person.cognome || "",

        "Data Nascita":
            person.dataNascita
                ? formatDate(
                    person.dataNascita
                )
                : "",

        Email:
            person.email || "",

        Telefono:
            person.telefono || "",

        Azienda:
            person.azienda || "",

        Città:
            person.citta || "",

        Indirizzo:
            person.indirizzo || "",

        "Codice Fiscale":
            person.codiceFiscale || "",

        Note:
            person.note || ""

    }));

}

// =====================================================
// EXCEL EXPORT
// =====================================================

function exportExcel() {

    try {

        const data =
            getExportData();

        if (data.length === 0) {

            showMessage(
                "Nessun record da esportare",
                "error"
            );

            return;

        }

        const workbook =
            XLSX.utils.book_new();

        const worksheet =
            XLSX.utils.json_to_sheet(
                data
            );

        const columnWidths = [

            { wch: 20 }, // Nome
            { wch: 25 }, // Cognome
            { wch: 15 }, // Data
            { wch: 35 }, // Email
            { wch: 20 }, // Telefono
            { wch: 30 }, // Azienda
            { wch: 20 }, // Città
            { wch: 40 }, // Indirizzo
            { wch: 20 }, // CF
            { wch: 50 }  // Note

        ];

        worksheet["!cols"] =
            columnWidths;

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Anagrafica"
        );

        const timestamp =
            new Date()
                .toISOString()
                .split("T")[0];

        const fileName =
            `Anagrafica_${timestamp}.xlsx`;

        XLSX.writeFile(
            workbook,
            fileName
        );

        showMessage(
            "Export Excel completato",
            "success"
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Errore export Excel",
            "error"
        );

    }

}

// =====================================================
// PDF EXPORT
// =====================================================

async function exportPDF() {

    try {

        if (
            !window.people ||
            window.people.length === 0
        ) {

            showMessage(
                "Nessun record disponibile",
                "error"
            );

            return;

        }

        const {
            jsPDF
        } = window.jspdf;

        const doc =
            new jsPDF({
                orientation:
                    "landscape",
                unit:
                    "mm",
                format:
                    "a4"
            });

        let y = 15;

        doc.setFontSize(18);

        doc.text(
            "Anagrafica Enterprise",
            14,
            y
        );

        y += 8;

        doc.setFontSize(10);

        doc.text(
            "Data esportazione: " +
            new Date()
                .toLocaleString(
                    "it-IT"
                ),
            14,
            y
        );

        y += 15;

        window.people.forEach(
            (
                person,
                index
            ) => {

                if (y > 180) {

                    doc.addPage();

                    y = 20;

                }

                doc.setFontSize(12);

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    `${index + 1}. ${person.nome || ""} ${person.cognome || ""}`,
                    14,
                    y
                );

                y += 6;

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(10);

                doc.text(
                    `Azienda: ${person.azienda || ""}`,
                    20,
                    y
                );

                y += 5;

                doc.text(
                    `Email: ${person.email || ""}`,
                    20,
                    y
                );

                y += 5;

                doc.text(
                    `Telefono: ${person.telefono || ""}`,
                    20,
                    y
                );

                y += 5;

                doc.text(
                    `Città: ${person.citta || ""}`,
                    20,
                    y
                );

                y += 5;

                doc.text(
                    `Codice Fiscale: ${person.codiceFiscale || ""}`,
                    20,
                    y
                );

                y += 10;

            }
        );

        const timestamp =
            new Date()
                .toISOString()
                .split("T")[0];

        doc.save(
            `Anagrafica_${timestamp}.pdf`
        );

        showMessage(
            "Export PDF completato",
            "success"
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Errore export PDF",
            "error"
        );

    }

}

// =====================================================
// CSV EXPORT
// =====================================================

function exportCSV() {

    try {

        const rows =
            getExportData();

        if (
            rows.length === 0
        ) {

            showMessage(
                "Nessun dato da esportare",
                "error"
            );

            return;

        }

        const headers =
            Object.keys(
                rows[0]
            );

        const csv = [

            headers.join(";"),

            ...rows.map(row =>
                headers
                    .map(h =>
                        `"${String(
                            row[h] ?? ""
                        ).replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(";")
            )

        ].join("\n");

        downloadFile(

            "Anagrafica.csv",

            csv,

            "text/csv;charset=utf-8"

        );

        showMessage(
            "Export CSV completato",
            "success"
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Errore export CSV",
            "error"
        );

    }

}

// =====================================================
// EXPORT SINGLE RECORD
// =====================================================

function exportPerson(person) {

    if (!person)
        return;

    const content = `

Nome: ${person.nome || ""}

Cognome: ${person.cognome || ""}

Data Nascita: ${person.dataNascita || ""}

Email: ${person.email || ""}

Telefono: ${person.telefono || ""}

Azienda: ${person.azienda || ""}

Città: ${person.citta || ""}

Indirizzo: ${person.indirizzo || ""}

Codice Fiscale: ${person.codiceFiscale || ""}

Note:

${person.note || ""}

`;

    const fileName =
        `${person.cognome || "Scheda"}_${person.nome || ""}.txt`;

    downloadFile(

        fileName,

        content,

        "text/plain"

    );

}

// =====================================================
// EVENT HANDLERS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const excelBtn =
            document.getElementById(
                "excelBtn"
            );

        const pdfBtn =
            document.getElementById(
                "pdfBtn"
            );

        if (excelBtn) {

            excelBtn.addEventListener(
                "click",
                exportExcel
            );

        }

        if (pdfBtn) {

            pdfBtn.addEventListener(
                "click",
                exportPDF
            );

        }

    }
);

// =====================================================
// PUBLIC API
// =====================================================

window.ExportManager = {

    exportExcel,

    exportPDF,

    exportCSV,

    exportPerson

};