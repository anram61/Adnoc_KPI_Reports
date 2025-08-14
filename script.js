// ====== Elements ======
const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');
const pdfContainer = document.getElementById('pdf-viewer-container');
const fallbackMessage = document.getElementById('fallback-message');

let selectedCompany = '';
let selectedMonth = '';

// ====== Reports PDF Mapping ======
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

// ====== Storage Helpers ======
function getStorageKey(company, month) {
  return `${company}_${month}_report`;
}
function saveReportToStorage(company, month, html) {
  if (!company || !month) return;
  localStorage.setItem(getStorageKey(company, month), html);
  const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
  latestMap[company] = month;
  localStorage.setItem('kpi-latest', JSON.stringify(latestMap));
}
function getReportFromStorage(company, month) {
  return localStorage.getItem(getStorageKey(company, month));
}

// ====== PDF.js Setup ======
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

async function renderPDF(pdfPath) {
  pdfContainer.innerHTML = "";
  try {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const containerWidth = pdfContainer.clientWidth || 900;
    const devicePixelRatio = window.devicePixelRatio || 1;
    let viewport = page.getViewport({ scale: 1 });
    let scale = (containerWidth / viewport.width) * devicePixelRatio;
    const scaledViewport = page.getViewport({ scale: scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    canvas.style.width = (scaledViewport.width / devicePixelRatio) + "px";
    canvas.style.height = (scaledViewport.height / devicePixelRatio) + "px";

    const pageContainer = document.createElement("div");
    pageContainer.style.position = "relative";
    pageContainer.style.width = canvas.style.width;
    pageContainer.style.height = canvas.style.height;

    pageContainer.appendChild(canvas);
    pdfContainer.appendChild(pageContainer);

    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

  } catch (err) {
    pdfContainer.innerHTML = `<p style="color:red;">Error loading PDF: ${err.message}</p>`;
  }
}

// ====== Display Report ======
function displayReport() {
  if (!selectedCompany) return;
  reportCompany.textContent = selectedCompany;
  pdfContainer.innerHTML = "";

  const month = selectedMonth || null;
  let html = null;

  if (month) html = getReportFromStorage(selectedCompany, month);
  else {
    const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    const latestMonth = latestMap[selectedCompany];
    if (latestMonth) html = getReportFromStorage(selectedCompany, latestMonth);
  }

  if (html) {
    fallbackMessage.textContent = "";
    pdfContainer.innerHTML = html;
    return;
  }

  // Fallback PDF
  const pdfPath = reportPDFs[selectedCompany]?.[month] || reportPDFs[selectedCompany]?.default;
  if (pdfPath) {
    fallbackMessage.textContent = "Showing latest available report";
    renderPDF(pdfPath);
  } else {
    fallbackMessage.textContent = "";
    pdfContainer.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong>${month ? " in " + month : ""}.</p>`;
  }
}

// ====== Event Listeners ======
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    selectedMonth = "";
    monthDropdown.value = "";
    displayReport();
  });
});

monthDropdown.addEventListener('change', () => {
  selectedMonth = monthDropdown.value;
  displayReport();
});
