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

    const containerWidth = pdfContainer.clientWidth || 800;
    const devicePixelRatio = window.devicePixelRatio || 1;

    const viewport = page.getViewport({ scale: 1 });
    let scale = containerWidth / viewport.width;
    scale = scale * devicePixelRatio;

    const scaledViewport = page.getViewport({ scale: scale });

    // Create canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    canvas.style.width = (scaledViewport.width / devicePixelRatio) + "px";
    canvas.style.height = (scaledViewport.height / devicePixelRatio) + "px";

    // Container for PDF page and clickable areas
    const pageContainer = document.createElement("div");
    pageContainer.style.position = "relative";
    pageContainer.style.width = canvas.style.width;
    pageContainer.style.height = canvas.style.height;

    pageContainer.appendChild(canvas);
    pdfContainer.appendChild(pageContainer);

    // Render the page
    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

    // Add clickable links without ghost text
    const annotations = await page.getAnnotations();
    annotations.forEach(annotation => {
      if (annotation.subtype === 'Link' && annotation.url) {
        const [x1, y1, x2, y2] = annotation.rect;
        const rect = pdfjsLib.Util.normalizeRect([
          x1, y1, x2, y2
        ]);

        const linkEl = document.createElement('a');
        linkEl.href = annotation.url;
        linkEl.target = '_blank';
        linkEl.style.position = 'absolute';
        linkEl.style.left = (rect[0] * scale / devicePixelRatio) + 'px';
        const verticalOffset = window.innerWidth >= 769 ? 50 : 0;
        linkEl.style.top = ((pageContainer.clientHeight - (rect[3] * scale / devicePixelRatio)) - verticalOffset) + 'px';
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

  // 1) If a month is chosen, try generated HTML first
  if (selectedMonth) {
    const html = localStorage.getItem(storageKey(selectedCompany, selectedMonth));
    if (html) {
      reportText.innerHTML = `<p><em>Showing generated dashboard (${selectedMonth} 2025)</em></p>`;
      pdfContainer.innerHTML = ""; // clear PDF area
      // render generated HTML
      const holder = document.createElement('div');
      holder.innerHTML = html;
      pdfContainer.appendChild(holder);
      return;
    }
  }

  // 2) If no month chosen, try latest saved for company
  if (!selectedMonth) {
    const latest = getLatestSavedForCompany(selectedCompany);
    if (latest && latest.month) {
      const html = localStorage.getItem(storageKey(selectedCompany, latest.month));
      if (html) {
        reportText.innerHTML = `<p><em>Showing generated dashboard (Latest: ${latest.month} 2025)</em></p>`;
        pdfContainer.innerHTML = "";
        const holder = document.createElement('div');
        holder.innerHTML = html;
        pdfContainer.appendChild(holder);
        return;
      }
    }
  }

  // 3) Fallback to PDF (existing logic)
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
