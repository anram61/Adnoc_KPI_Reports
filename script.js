const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');
const pdfContainer = document.createElement('div');
pdfContainer.id = "pdf-viewer-container";
pdfContainer.style.width = "100%";
pdfContainer.style.height = "auto";
reportText.insertAdjacentElement('afterend', pdfContainer);

let selectedCompany = '';
let selectedMonth = '';

// Map of available reports
const reportPDFs = {
  "Adnoc Offshore": {
    default: "reports/offshore-report.pdf"
  },
  "Adnoc Global Trading": {
    default: "reports/AGT.pdf"
  },
  "Year to date Average": {
    default: "reports/YTD.pdf"
  }
  // Add more companies here if needed
};

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

function displayReport() {
  if (!selectedCompany) return;

  reportCompany.textContent = selectedCompany;

  let pdfPath = "";
  let message = "";

  if (selectedMonth && reportPDFs[selectedCompany]?.[selectedMonth]) {
    pdfPath = reportPDFs[selectedCompany][selectedMonth];
    message = `<p>Showing report for <strong>${selectedMonth} 2025</strong>.</p>`;
  } else if (reportPDFs[selectedCompany]?.default) {
    pdfPath = reportPDFs[selectedCompany].default;
    message = `<p><em>Currently showing the latest available report.</em></p>`;
  }

  // Show the text message above the PDF
  reportText.innerHTML = message;

  // Clear previous PDF
  pdfContainer.innerHTML = "";

  if (pdfPath) {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    loadingTask.promise.then(function (pdf) {
      // Render first page
      pdf.getPage(1).then(function (page) {
        const scale = 1.2; // Adjust zoom level here
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        pdfContainer.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    }).catch(function (error) {
      console.error("Error loading PDF:", error);
      pdfContainer.innerHTML = "<p>Failed to load PDF.</p>";
    });
  } else {
    pdfContainer.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong>${selectedMonth ? " in " + selectedMonth : ""}.</p>`;
  }
}

// Handle company selection
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    selectedMonth = ''; // Reset to default (latest)
    if (monthDropdown) monthDropdown.value = ''; // Reset dropdown if it exists
    displayReport();
  });
});

// Handle month selection
if (monthDropdown) {
  monthDropdown.addEventListener('change', () => {
    selectedMonth = monthDropdown.value;
    displayReport();
  });
}
