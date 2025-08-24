// ------- Home Page Script -------

const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');
const pdfContainer = document.getElementById('pdf-viewer-container');

let selectedCompany = '';
let selectedMonth = '';

// Map of default PDFs
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
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

async function renderPDF(pdfPath) {
  pdfContainer.innerHTML = "";
  if (!pdfPath) {
    pdfContainer.innerHTML = `<p style="color:red;">No PDF available.</p>`;
    return;
  }

  try {
    const pdf = await pdfjsLib.getDocument(pdfPath).promise;
    const page = await pdf.getPage(1);

    const containerWidth = pdfContainer.clientWidth || 900;
    const viewport = page.getViewport({ scale: 1 });

    // High DPI scale
    const scale = containerWidth / viewport.width * window.devicePixelRatio;
    const scaledViewport = page.getViewport({ scale: scale });

    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    canvas.style.width = containerWidth + "px";
    canvas.style.height = (scaledViewport.height / window.devicePixelRatio) + "px";

    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

    const pageContainer = document.createElement("div");
    pageContainer.style.width = "100%";
    pageContainer.style.position = "relative";
    pageContainer.appendChild(canvas);
    pdfContainer.appendChild(pageContainer);

    // Add links
    const annotations = await page.getAnnotations();
    annotations.forEach(a => {
      if (a.subtype === 'Link' && a.url) {
        const [x1, y1, x2, y2] = a.rect;
        const rect = pdfjsLib.Util.normalizeRect([x1, y1, x2, y2]);
        const link = document.createElement('a');
        link.href = a.url;
        link.target = '_blank';
        link.style.position = 'absolute';
        link.style.left = (rect[0] * scale / window.devicePixelRatio) + 'px';
        link.style.top = (scaledViewport.height / window.devicePixelRatio - rect[3] * scale / window.devicePixelRatio) + 'px';
        link.style.width = ((rect[2] - rect[0]) * scale / window.devicePixelRatio) + 'px';
        link.style.height = ((rect[3] - rect[1]) * scale / window.devicePixelRatio) + 'px';
        link.style.zIndex = 10;
        link.style.background = 'transparent';
        link.style.cursor = 'pointer';
        pageContainer.appendChild(link);
      }
    });

  } catch (err) {
    pdfContainer.innerHTML = `<p style="color:red;">Error loading PDF: ${err.message}</p>`;
  }
}



// Storage helpers
function storageKey(company, month) {
  return `kpi-report::${company}::${month}`;
}
function getLatestSavedForCompany(company) {
  try {
    const map = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    return map[company] || null;
  } catch { return null; }
}

// Display report (restored exactly as original)
function displayReport() {
  if (!selectedCompany) return;
  reportCompany.textContent = selectedCompany;
  pdfContainer.innerHTML = "";

  const month = selectedMonth || null;
  let html = null;

  if (month) html = localStorage.getItem(storageKey(selectedCompany, month));
  else {
    const latest = getLatestSavedForCompany(selectedCompany);
    if (latest?.month) html = localStorage.getItem(storageKey(selectedCompany, latest.month));
  }

if (html) {
  reportText.innerHTML = `<p><em>Showing generated dashboard${month ? ` (${month} 2025)` : ""}</em></p>`;

  if (html.trim().startsWith('<html') || html.trim().startsWith('<div')) {
    const iframe = document.createElement('iframe');
    iframe.style.width = "100%";
    iframe.style.height = "700px";
    iframe.style.border = "none";
    pdfContainer.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    return;
  }
}



  const pdfPath = reportPDFs[selectedCompany]?.[month] || reportPDFs[selectedCompany]?.default;
  if (pdfPath) {
    reportText.innerHTML = `<p><em>${month ? `Showing report for ${month} 2025` : "Currently showing the latest available PDF."}</em></p>`;
    renderPDF(pdfPath);
  } else {
    reportText.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong>${month ? " in " + month : ""}.</p>`;
  }
}

// Event listeners
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

const deleteGeneratedBtn = document.getElementById('delete-generated-report-btn');
if (deleteGeneratedBtn) {
  deleteGeneratedBtn.addEventListener('click', () => {
    if (!selectedCompany || !selectedMonth) {
      alert("Select company & month.");
      return;
    }

    const key = `kpi-report::${selectedCompany}::${selectedMonth}`;
    if (!localStorage.getItem(key)) {
      alert("No generated report to delete for this selection.");
      return;
    }

    localStorage.removeItem(key);

    // Update latest map
    const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    if (latestMap[selectedCompany]?.month === selectedMonth) {
      delete latestMap[selectedCompany];
      localStorage.setItem('kpi-latest', JSON.stringify(latestMap));
    }

    pdfContainer.innerHTML = '';
    reportText.innerHTML = `<p>Generated report deleted for <strong>${selectedCompany}</strong> (${selectedMonth} 2025).</p>`;
    alert(`Deleted generated report for ${selectedCompany} (${selectedMonth} 2025)`);
  });
}
