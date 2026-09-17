// Document records store
const documents = [
    {
        title: "0000403.101",
        status: "Pending",
        date: "17-Sep-2026",
        quantity: 3,
        description: "Invoice package batch 101 requiring validation and document archive."
    },
    {
        title: "0000403.102",
        status: "Completed",
        date: "17-Sep-2026",
        quantity: 2,
        description: "Processed tax statements and identity verification forms."
    },
    {
        title: "0000403.103",
        status: "Pending",
        date: "17-Sep-2026",
        quantity: 5,
        description: "Purchase order requests for IT equipment and software licenses."
    },
    {
        title: "0000403.104",
        status: "Pending",
        date: "16-Sep-2026",
        quantity: 1,
        description: "Employee onboarding documents and compliance files."
    },
    {
        title: "0000403.105",
        status: "Completed",
        date: "16-Sep-2026",
        quantity: 4,
        description: "Monthly vendor summary statements and clearance receipts."
    }
];

// Currently opened document tracker
let activeDocument = null;

// Initialize table on load
document.addEventListener("DOMContentLoaded", () => {
    renderTable();
});

// Render table from JavaScript Array
function renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    documents.forEach((doc) => {
        const row = document.createElement("tr");

        // Format ID safely for automation stability (e.g. title-0000403-101)
        const safeTitleId = "title-" + doc.title.replace(/\./g, "-");

        const statusClass = doc.status.toLowerCase() === "pending" ? "status-pending" : "status-completed";

        row.innerHTML = `
            <td>
                <a href="#" id="${safeTitleId}" class="title-link" onclick="openDetail('${doc.title}'); return false;">
                    ${doc.title}
                </a>
            </td>
            <td><span class="status-badge ${statusClass}">${doc.status}</span></td>
            <td>${doc.date}</td>
            <td>${doc.quantity}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Open Detail View
function openDetail(title) {
    const doc = documents.find(d => d.title === title);
    if (!doc) return;

    activeDocument = doc;

    document.getElementById("detailTitle").innerText = doc.title;
    document.getElementById("detailStatus").innerText = doc.status;
    document.getElementById("detailDate").innerText = doc.date;
    document.getElementById("detailQuantity").innerText = doc.quantity;
    document.getElementById("detailDescription").innerText = doc.description;

    document.getElementById("tableSection").classList.add("hidden");
    document.getElementById("detailSection").classList.remove("hidden");
}

// Hide Detail View and Return to Table
function hideDetail() {
    activeDocument = null;
    document.getElementById("detailSection").classList.add("hidden");
    document.getElementById("tableSection").classList.remove("hidden");
}

// Download Table data as CSV (Excel compatible)
function downloadExcel() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Title,Status,Date,Item Quantity\n";

    documents.forEach((doc) => {
        const row = `"${doc.title}","${doc.status}","${doc.date}",${doc.quantity}`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Document_Records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Downloads valid dummy ZIP files based on Item Quantity.
 * Creates standard PK ZIP headers in pure JavaScript (no external libraries).
 */
function downloadAllZip() {
    if (!activeDocument) return;

    const count = activeDocument.quantity;
    const title = activeDocument.title;

    for (let i = 1; i <= count; i++) {
        // Pad file index with leading zeros (e.g. 01, 02)
        const indexStr = i.toString().padStart(2, "0");
        const fileName = `${title}_${indexStr}.zip`;
        const fileContent = `Mock content file for document ${title}, item ${indexStr}.`;

        // Generate dynamic dummy zip binary data
        const zipBlob = createDummyZipBlob(fileContent, `document_${indexStr}.txt`);

        // Trigger individual file downloads
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(zipBlob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}

/**
 * Helper to produce a valid, extractable ZIP archive natively in standard JavaScript.
 */
function createDummyZipBlob(contentString, textFilename) {
    const encoder = new TextEncoder();
    const fileData = encoder.encode(contentString);
    const fileNameData = encoder.encode(textFilename);

    // Dynamic ZIP structures (Local File Header + Central Directory + End of Central Directory)
    const localHeader = new Uint8Array([
        0x50, 0x4b, 0x03, 0x04, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        fileNameData.length, 0, 0, 0,
        ...fileNameData,
        ...fileData
    ]);

    const localHeaderSize = localHeader.length;

    const centralDir = new Uint8Array([
        0x50, 0x4b, 0x01, 0x02, 20, 0, 20, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        fileNameData.length, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ...fileNameData
    ]);

    const centralDirSize = centralDir.length;

    const eocd = new Uint8Array([
        0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 1, 0, 1, 0,
        centralDirSize & 0xff, (centralDirSize >> 8) & 0xff, 0, 0,
        localHeaderSize & 0xff, (localHeaderSize >> 8) & 0xff, 0, 0,
        0, 0
    ]);

    return new Blob([localHeader, centralDir, eocd], { type: "application/zip" });
}
