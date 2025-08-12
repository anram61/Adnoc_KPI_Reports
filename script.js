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

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

function renderPDF(pdfPath) {
  pdfContainer.innerHTML = ""; // clear previous canvas

  const loadingTask = pdfjsLib.getDocument(pdfPath);
  loadingTask.promise.then(pdf => {
    pdf.getPage(1).then(page => {
      // Dynamically set scale for responsiveness
      let scale = window.innerWidth < 600 ? 0.8 : 1.25;

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
  const selected = selectedMonth || "default";

  // Clear old report content and PDF viewer
  reportText.innerHTML = "";
  pdfContainer.innerHTML = "";

  // Check for HTML report in localStorage (dashboard HTML)
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

  // Fallback to PDF rendering with PDF.js
  const pdfPath = reportPDFs[selectedCompany]?.[selected] || reportPDFs[selectedCompany]?.default;
  if (pdfPath) {
    reportText.innerHTML = `<p><em>Currently showing the latest available PDF report.</em></p>`;
    renderPDF(pdfPath);
  } else {
    reportText.innerHTML = `<p>No report found for <strong>${selectedCompany}</strong>.</p>`;
  }
}

// Company button click
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
