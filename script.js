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

// Render PDF professionally
async function renderPDF(pdfPath) {
  pdfContainer.innerHTML = "";

  try {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const containerWidth = pdfContainer.clientWidth || 900;
    const devicePixelRatio = window.devicePixelRatio || 1;
    let viewport = page.getViewport({ scale: 1 });
    let scale = containerWidth / viewport.width;
    scale = scale * devicePixelRatio;
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

    // Add clickable links
    const annotations = await page.getAnnotations();
    annotations.forEach(annotation => {
      if (annotation.subtype === 'Link' && annotation.url) {
        const [x1, y1, x2, y2] = annotation.rect;
        const rect = pdfjsLib.Util.normalizeRect([x1, y1, x2, y2]);
        const linkEl = document.createElement('a');
        linkEl.href = annotation.url;
        linkEl.target = '_blank';
        linkEl.style.position = 'absolute';
        linkEl.style.left = (rect[0] * scale / devicePixelRatio) + 'px';
        linkEl.style.bottom = (rect[1] * scale / devicePixelRatio) + 'px';
        linkEl.style.width = ((rect[2] - rect[0]) * scale / devicePixelRatio) + 'px';
        linkEl.style.height = ((rect[3] - rect[1]) * scale / devicePixelRatio) + 'px';
        linkEl.style.zIndex = 10;
        linkEl.style.background = 'transparent';
        linkEl.style.cursor = 'pointer';
        pageContainer.appendChild(linkEl);
      }
    });

  } catch (err) {
    pdfContainer.innerHTML = `<p style="color:red;">Error loading PDF: ${err.message}</p>`;
  }
}

function storageKey(company, month) {
  return `kpi-report::${company}::${month}`;
}

function getLatestSavedForCompany(company) {
  try {
    const map = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    return map[company] || null;
  } catch { return null; }
}

function displayReport() {
  if (!selectedCompany) return;
  reportCompany.textContent = selectedCompany;
  pdfContainer.innerHTML = "";

  const month = selectedMonth || null;
  let html = null;

  // Try localStorage HTML first
  if (month) html = localStorage.getItem(storageKey(selectedCompany, month));
  else {
    const latest = getLatestSavedForCompany(selectedCompany);
    if (latest?.month) html = localStorage.getItem(storageKey(selectedCompany, latest.month));
  }

  if (html) {
    reportText.innerHTML = `<p><em>Showing generated dashboard${month ? ` (${month} 2025)` : ""}</em></p>`;
    const holder = document.createElement('div');
    holder.innerHTML = html;
    pdfContainer.appendChild(holder);
    return;
  }

  // Fallback to PDF
  const pdfPath = reportPDFs[selectedCompany]?.[month] || reportPDFs[selectedCompany]?.default;
  if (pdfPath) {
    reportText.innerHTML = `<p><em>${month ? `Showing report for ${month} 2025` : "Currently showing the latest available PDF."}</em></p>`;
    renderPDF(pdfPath);
  } else {
    reportText.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong>${month ? " in " + month : ""}.</p>`;
  }
}


// Save generated HTML to localStorage
function saveReportToStorage(company, month, html) {
  if (!company || !month) return;
  localStorage.setItem(storageKey(company, month), html);

  const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
  latestMap[company] = { month };
  localStorage.setItem('kpi-latest', JSON.stringify(latestMap));
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

// Save Report Button
const saveBtn = document.getElementById('save-report-btn');
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    if (!selectedCompany || !selectedMonth) {
      alert("Please select a company and month before saving.");
      return;
    }
    if (pdfContainer.innerHTML.trim() === "") {
      alert("Nothing to save. Generate the report first.");
      return;
    }
    saveReportToStorage(selectedCompany, selectedMonth, pdfContainer.innerHTML);
    alert(`Report saved for ${selectedCompany} (${selectedMonth} 2025).`);
  });
}

// Delete Report Button
const deleteBtn = document.getElementById('delete-report-btn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    if (!selectedCompany || !selectedMonth) {
      alert("Please select a company and month before deleting.");
      return;
    }
    const key = storageKey(selectedCompany, selectedMonth);
    localStorage.removeItem(key);

    // Update latest map
    const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    if (latestMap[selectedCompany]?.month === selectedMonth) {
      delete latestMap[selectedCompany];
      localStorage.setItem('kpi-latest', JSON.stringify(latestMap));
    }

    alert(`Report deleted for ${selectedCompany} (${selectedMonth} 2025).`);
    pdfContainer.innerHTML = "";
    reportText.innerHTML = `<p>Report deleted for <strong>${selectedCompany}</strong> (${selectedMonth} 2025).</p>`;
  });
}
