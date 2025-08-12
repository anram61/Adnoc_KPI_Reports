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

// PDF.js setup
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

function renderPDF(pdfPath) {
  pdfContainer.innerHTML = ""; // clear old content

  const loadingTask = pdfjsLib.getDocument(pdfPath);
  loadingTask.promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const scale = 1.25; // Adjust zoom
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: context, viewport: viewport };
      page.render(renderContext).promise.then(() => {
        pdfContainer.appendChild(canvas);
        pdfContainer.style.height = canvas.height + "px";
      });
    });
  }).catch(err => {
    pdfContainer.innerHTML = `<p style="color:red;">Error loading PDF: ${err.message}</p>`;
  });
}

function displayReport() {
  if (!selectedCompany) return;

  reportCompany.textContent = selectedCompany;

  const pdfPath = reportPDFs[selectedCompany]?.[selectedMonth] || reportPDFs[selectedCompany]?.default;

  if (pdfPath) {
    reportText.innerHTML = `
      <p><em>${selectedMonth ? `Showing report for ${selectedMonth} 2025` : "Currently showing the latest available report."}</em></p>
    `;
    renderPDF(pdfPath);
  } else {
    reportText.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong>${selectedMonth ? " in " + selectedMonth : ""}.</p>`;
    pdfContainer.innerHTML = "";
  }
}

// Handle company selection
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    selectedMonth = "";
    monthDropdown.value = "";
    displayReport();
  });
});

// Handle month selection
monthDropdown.addEventListener('change', () => {
  selectedMonth = monthDropdown.value;
  displayReport();
});
