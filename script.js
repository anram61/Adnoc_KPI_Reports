const companyButtons = document.querySelectorAll(".company");
const monthDropdown = document.getElementById("month-dropdown");
const reportCompanyElem = document.getElementById("report-company");
const reportTextElem = document.getElementById("report-text");
const pdfViewerContainer = document.getElementById("pdf-viewer-container");

let selectedCompany = null;
let selectedMonth = null;

const offshorePDFUrl = "reports/offshore-report.pdf"; // path to offshore PDF file

function clearReport() {
  reportCompanyElem.textContent = "N/A";
  reportTextElem.innerHTML = "<p>Please select a company to see the KPI summary.</p>";
  pdfViewerContainer.innerHTML = "";
}

// Render PDF using PDF.js (default)
async function renderPDF(url) {
  pdfViewerContainer.innerHTML = ""; // clear container

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  pdfViewerContainer.appendChild(canvas);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  await page.render(renderContext).promise;
}

// Show iframe for Offshore only
function renderOffshoreIframe() {
  pdfViewerContainer.innerHTML = ""; // clear container
  const iframe = document.createElement("iframe");
  iframe.src = offshorePDFUrl;
  iframe.width = "100%";
  iframe.height = "600px"; // adjust as needed
  iframe.style.border = "none";
  pdfViewerContainer.appendChild(iframe);
}

// Main function to update report
function updateReport() {
  if (!selectedCompany) {
    clearReport();
    return;
  }

  reportCompanyElem.textContent = selectedCompany;

  // Example report text for demo, you can replace with real summary data
  reportTextElem.innerHTML = `<p>Showing KPI summary for <strong>${selectedCompany}</strong> ${
    selectedMonth ? `in <strong>${selectedMonth}</strong>` : ""
  }.</p>`;

  // For Offshore, use iframe viewer
  if (selectedCompany === "Adnoc Offshore") {
    renderOffshoreIframe();
  } else {
    // For other companies, load the PDF using PDF.js or show a message
    // For demo, just clear or you can add logic for other PDFs
    pdfViewerContainer.innerHTML = "<p>No PDF viewer configured for this company.</p>";
  }
}

// Event listeners
companyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedCompany = btn.getAttribute("data-company");
    updateReport();
  });
});

monthDropdown.addEventListener("change", () => {
  selectedMonth = monthDropdown.value;
  updateReport();
});

// Initialize
clearReport();
