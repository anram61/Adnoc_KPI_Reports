// ===== Helper Functions =====
function getStorageKey(company, month) {
    return `${company}_${month}_report`;
}

function saveReport(company, month, html) {
    localStorage.setItem(getStorageKey(company, month), html);
}

function getReport(company, month) {
    return localStorage.getItem(getStorageKey(company, month));
}

// ===== UI Elements =====
const companyButtons = document.querySelectorAll(".company-btn");
const monthSelect = document.getElementById("monthSelect");
const reportContainer = document.getElementById("reportContainer");
let selectedCompany = null;
let selectedMonth = null;

// ===== Company PDF Mapping =====
const pdfReports = {
    "Adnoc Onshore": { default: "reports/onshore-report.pdf" },
    "Adnoc Offshore": { default: "reports/offshore-report.pdf" },
    "Adnoc Al Dhafra & Al Yasat": { default: "reports/aldhafra-report.pdf" },
    "Adnoc Drilling": { default: "reports/drilling-report.pdf" },
    "Adnoc Sour Gas": { default: "reports/sourgas-report.pdf" },
    "Adnoc Refining": { default: "reports/refining-report.pdf" },
    "Adnoc Distribution": { default: "reports/distribution-report.pdf" },
    "Adnoc Borouge": { default: "reports/borouge-report.pdf" },
    "Adnoc L & S": { default: "reports/ls-report.pdf" },
    "Adnoc Global Trading": { default: "reports/agt-report.pdf" },
    "Adnoc Gas": { default: "reports/gas-report.pdf" },
};

// ===== Display Report =====
function displayReport() {
    if (!selectedCompany || !selectedMonth) return;

    const savedHtml = getReport(selectedCompany, selectedMonth);
    if (savedHtml) {
        reportContainer.innerHTML = `<div class="generated-report">${savedHtml}</div>`;
    } else {
        const pdfPath = pdfReports[selectedCompany]?.[selectedMonth] || pdfReports[selectedCompany]?.default;
        if (pdfPath) {
            reportContainer.innerHTML = `<iframe src="${pdfPath}" width="100%" height="100%" style="border:none;"></iframe>`;
        } else {
            reportContainer.innerHTML = `<p>No report available.</p>`;
        }
    }
}

// ===== Event Listeners =====
companyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        selectedCompany = btn.textContent.trim();
        displayReport();
    });
});

monthSelect.addEventListener("change", () => {
    selectedMonth = monthSelect.value;
    displayReport();
});
