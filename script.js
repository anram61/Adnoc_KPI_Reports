const companyButtons = document.querySelectorAll(".company");
const monthDropdown = document.getElementById("month-dropdown");
const reportCompanyElem = document.getElementById("report-company");
const reportTextElem = document.getElementById("report-text");
const pdfViewerContainer = document.getElementById("pdf-viewer-container");

let selectedCompany = null;
let selectedMonth = null;

// Path to offshore PDF report iframe
const offshorePDFUrl = "reports/offshore-report.pdf"; // update this path if needed

// Clear report display
function clearReport() {
  reportCompanyElem.textContent = "N/A";
  reportTextElem.innerHTML = "<p>Please select a company to see the KPI summary.</p>";
  pdfViewerContainer.innerHTML = "";
}

// Render PDF with PDF.js canvas
async function renderPDF(url) {
  pdfViewerContainer.innerHTML = ""; // clear previous

  const loadingTask = pdfjsLib.getDocument(url);
  try {
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
  } catch (error) {
    pdfViewerContainer.innerHTML = `<p style="color:red;">Failed to load PDF: ${error.message}</p>`;
  }
}

// Render Offshore PDF using iframe
function renderOffshoreIframe() {
  pdfViewerContainer.innerHTML = ""; // clear previous
  const iframe = document.createElement("iframe");
  iframe.src = offshorePDFUrl;
  iframe.setAttribute("aria-label", "Adnoc Offshore KPI Report");
  pdfViewerContainer.appendChild(iframe);
}

// Main update function
function updateReport() {
  if (!selectedCompany) {
    clearReport();
    return;
  }

  reportCompanyElem.textContent = selectedCompany;

  // Show the selected month or 'latest'
  const monthText = selectedMonth ? `in ${selectedMonth}` : "(latest available)";

  reportTextElem.innerHTML = `<p>Showing KPI summary for <strong>${selectedCompany}</strong> ${monthText}.</p>`;

  if (selectedCompany === "Adnoc Offshore") {
    // Offshore: iframe viewer
    renderOffshoreIframe();
  } else {
    // Other companies: PDF.js viewer
    // TODO: Update with actual PDF URLs per company & month if available
    // For demo, we show a placeholder message

    // Example PDF URL pattern - adjust as per your actual storage:
    // const pdfUrl = `reports/${selectedCompany.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-")}-${selectedMonth ? selectedMonth.toLowerCase() : "latest"}.pdf`;
    // For now, just show placeholder text:
    pdfViewerContainer.innerHTML = "<p>No PDF configured for this company/month yet.</p>";
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
