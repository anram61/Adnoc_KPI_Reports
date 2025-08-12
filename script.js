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

async function renderPDF(pdfPath) {
  pdfContainer.innerHTML = ""; // Clear previous content

  try {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    // Calculate scale based on container width to improve clarity
    const containerWidth = pdfContainer.clientWidth || 800;
    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale: scale });

    // Prepare canvas for rendering page
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Container to hold canvas and text layer
    const pageContainer = document.createElement("div");
    pageContainer.style.position = "relative";
    pageContainer.style.width = canvas.width + "px";
    pageContainer.style.height = canvas.height + "px";

    // Append canvas
    pageContainer.appendChild(canvas);
    pdfContainer.appendChild(pageContainer);

    // Render PDF page on canvas
    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

    // Prepare text layer for selectable text and links
    const textContent = await page.getTextContent();
    const textLayerDiv = document.createElement("div");
    textLayerDiv.className = "textLayer";
    textLayerDiv.style.position = "absolute";
    textLayerDiv.style.top = "0";
    textLayerDiv.style.left = "0";
    textLayerDiv.style.height = canvas.height + "px";
    textLayerDiv.style.width = canvas.width + "px";
    textLayerDiv.style.pointerEvents = "auto"; // Allow interaction with links
    pageContainer.appendChild(textLayerDiv);

    pdfjsLib.renderTextLayer({
      textContent,
      container: textLayerDiv,
      viewport: scaledViewport,
      textDivs: [],
      enhanceTextSelection: true,
    });

  } catch (err) {
    pdfContainer.innerHTML = `<p style="color:red;">Error loading PDF: ${err.message}</p>`;
  }
}

function displayReport() {
  if (!selectedCompany) return;

  reportCompany.textContent = selectedCompany;

  // Use selected month if available or fallback to default
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
