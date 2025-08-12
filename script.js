const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');
const pdfContainer = document.getElementById('pdf-viewer-container');

let selectedCompany = '';
let selectedMonth = '';

const reportPDFs = {
  "Adnoc Offshore": { default: "reports/offshore-report.pdf" },
  "Adnoc Global Trading": { default: "reports/AGT.pdf" },
  "Year to date Average": { default: "reports/YTD.pdf" },
  "Adnoc Onshore": { default: "reports/onshore.pdf" },
  "Adnoc Al Dhafra & Al Yasat": { default: "reports/alds.pdf" },
  "Adnoc Drilling": { default: "reports/drilling.pdf" },
  "Adnoc Sour Gas": { default: "reports/sourgas.pdf" },
  "Adnoc Refining": { default: "reports/refining.pdf" },
  "Adnoc Distribution": { default: "reports/distribution.pdf" },
  "Adnoc Borouge": { default: "reports/borouge.pdf" },
  "Adnoc L&S": { default: "reports/L&S.pdf" },
  "GBDO": { default: "reports/gbdo.pdf" },
  "Adnoc Gas": { default: "reports/adnocgas.pdf" },
};

function encodePDFUrl(url) {
  // URL encode the PDF url for embedding
  return encodeURIComponent(window.location.origin + "/" + url);
}

function displayReport() {
  if (!selectedCompany) return;

  reportCompany.textContent = selectedCompany;
  const selected = selectedMonth || "default";

  // Clear old content
  reportText.innerHTML = "";
  pdfContainer.innerHTML = "";

  // Check localStorage for HTML dashboard (optional)
  let reports = JSON.parse(localStorage.getItem("reports") || "{}");
  if (reports[selectedCompany] && reports[selectedCompany][selected]) {
    reportText.innerHTML = `
      <p><em>Showing dashboard report for <strong>${selected} 2025</strong>.</em></p>
      <div class="responsive-iframe-container">
        ${reports[selectedCompany][selected]}
      </div>
    `;
    return;
  }

  // Load PDF via embedded PDF.js viewer iframe
  const pdfPath = reportPDFs[selectedCompany]?.[selected] || reportPDFs[selectedCompany]?.default;
  if (pdfPath) {
    reportText.innerHTML = `<p><em>Currently showing the latest available PDF report.</em></p>`;

    const viewerBase = "https://mozilla.github.io/pdf.js/web/viewer.html?file=";
    const fullUrl = viewerBase + encodePDFUrl(pdfPath);

    const iframe = document.createElement("iframe");
    iframe.src = fullUrl;
    iframe.style.width = "100%";
    iframe.style.height = "80vh";
    iframe.style.border = "none";

    pdfContainer.appendChild(iframe);
  } else {
    reportText.innerHTML = `<p>No report found for <strong>${selectedCompany}</strong>.</p>`;
  }
}

// Company buttons click
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    selectedMonth = "";
    monthDropdown.value = "";
    displayReport();
  });
});

// Month dropdown change
monthDropdown.addEventListener('change', () => {
  selectedMonth = monthDropdown.value;
  displayReport();
});
