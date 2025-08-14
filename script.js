const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');
const pdfContainer = document.getElementById('pdf-viewer-container');

let selectedCompany = '';
let selectedMonth = '';

// PDF fallback paths
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

// Render trend chart
function renderTrendChart(canvasId, months, values) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Ensure 12 months are always shown
  const allMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthMap = {};
  months.forEach((m,i)=>monthMap[m] = values[i]);
  const displayValues = allMonths.map(m => monthMap[m] ?? null);

  new Chart(ctx, {
    type:'line',
    data:{
      labels: allMonths,
      datasets:[{
        label:'Trend',
        data: displayValues,
        borderWidth: 3,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.2)',
        spanGaps: true,
        tension: 0.3,
        fill: true
      }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{display:false}, tooltip:{enabled:true} },
      scales:{ y:{ min:0, max:5, ticks:{ stepSize:1 } } }
    }
  });
}

// Display Report
function displayReport() {
  if (!selectedCompany) return;
  reportCompany.textContent = selectedCompany;

  if (selectedMonth) {
    const saved = localStorage.getItem(storageKey(selectedCompany, selectedMonth));
    if (saved) {
      const data = JSON.parse(saved);
      reportText.innerHTML = `<p><em>Showing generated dashboard (${selectedMonth} 2025)</em></p>`;
      pdfContainer.innerHTML = data.html;

      // Render chart
      if (data.chart) {
        renderTrendChart('trendChart', data.chart.months, data.chart.values);
      }
      return;
    }
  }

  // Latest
  if (!selectedMonth) {
    const latest = getLatestSavedForCompany(selectedCompany);
    if (latest && latest.month) {
      const saved = localStorage.getItem(storageKey(selectedCompany, latest.month));
      if (saved) {
        const data = JSON.parse(saved);
        reportText.innerHTML = `<p><em>Showing generated dashboard (Latest: ${latest.month} 2025)</em></p>`;
        pdfContainer.innerHTML = data.html;
        if (data.chart) renderTrendChart('trendChart', data.chart.months, data.chart.values);
        return;
      }
    }
  }

  // Fallback to PDF
  const pdfPath = reportPDFs[selectedCompany]?.[selectedMonth] || reportPDFs[selectedCompany]?.default;
  if (pdfPath) {
    reportText.innerHTML = `<p><em>${selectedMonth ? `Showing report for ${selectedMonth} 2025` : "Currently showing the latest available report."}</em></p>`;
    renderPDF(pdfPath);
  } else {
    reportText.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong>${selectedMonth ? " in " + selectedMonth : ""}.</p>`;
    pdfContainer.innerHTML = "";
  }
}

// Save generated HTML to localStorage
function saveReportToStorage(company, month, html, chartData) {
  if (!company || !month) return;
  const obj = { html, chart: chartData };
  localStorage.setItem(storageKey(company, month), JSON.stringify(obj));

  const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
  latestMap[company] = { month };
  localStorage.setItem('kpi-latest', JSON.stringify(latestMap));
}

// Event Listeners
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

// Save button (assumes you have a button with id="save-report-btn")
const saveBtn = document.getElementById('save-report-btn');
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    if (!selectedCompany || !selectedMonth) {
      alert("Please select a company and month before saving.");
      return;
    }
    if (!pdfContainer.innerHTML.trim()) {
      alert("Nothing to save. Generate the report first.");
      return;
    }

    // Gather chart data if canvas exists
    const chartCanvas = document.getElementById('trendChart');
    let chartData = null;
    if (chartCanvas && chartCanvas.chartData) chartData = chartCanvas.chartData;

    saveReportToStorage(selectedCompany, selectedMonth, pdfContainer.innerHTML, chartData);
    alert(`Report saved for ${selectedCompany} (${selectedMonth} 2025).`);
  });
});

// Delete button (assumes button with id="delete-report-btn")
const deleteBtn = document.getElementById('delete-report-btn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    if (!selectedCompany || !selectedMonth) {
      alert("Please select a company and month before deleting.");
      return;
    }
    const key = storageKey(selectedCompany, selectedMonth);
    localStorage.removeItem(key);

    const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    if (latestMap[selectedCompany]?.month === selectedMonth) delete latestMap[selectedCompany];
    localStorage.setItem('kpi-latest', JSON.stringify(latestMap));

    alert(`Report deleted for ${selectedCompany} (${selectedMonth} 2025).`);
    pdfContainer.innerHTML = "";
    reportText.innerHTML = `<p>Report deleted for <strong>${selectedCompany}</strong> (${selectedMonth} 2025).</p>`;
  });
}
