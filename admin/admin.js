// ------- Storage helpers -------
const STORAGE_KEYS = {
  REPORTS: 'adnoc_reports',       // { [company]: { [month]: htmlString } }
  LATEST: 'adnoc_latest',         // { [company]: 'Month' }
  KPI: 'adnoc_kpi_scores'         // { [company]: number }
};

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ------- Elements -------
const el = (id) => document.getElementById(id);
const companyEl = el('company');
const monthEl = el('month');
const efficiencyEl = el('efficiency');
const peopleEl = el('people');
const profitOpsEl = el('profitOps');
const profitFinEl = el('profitFin');
const topKPIEl = el('topKPI');
const underPerfEl = el('underPerf');
const remedialEl = el('remedial');

const generateBtn = el('generate');
const resetBtn = el('resetForm');
const saveHomeBtn = el('saveHome');
const deletePreviewBtn = el('deletePreview');
const preview = el('reportPreview');
const kpiList = el('companyKpiList');
const form = document.getElementById("report-form");
const previewContainer = document.getElementById("live-preview");
const addBtn = document.getElementById("add-homepage-btn");
const deleteBtn = document.getElementById("delete-report-btn");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  generateReport();
});

function generateReport() {
  const company = document.getElementById("company").value;
  const month = document.getElementById("month").value;
  const eff = parseFloat(document.getElementById("efficiency").value) || 0;
  const ppl = parseFloat(document.getElementById("people").value) || 0;
  const profOps = parseFloat(document.getElementById("profitOps").value) || 0;
  const profFin = parseFloat(document.getElementById("profitFin").value) || 0;
  const topKPI = document.getElementById("topKPI").value;
  const underKPI = document.getElementById("underKPI").value;
  const remedial = document.getElementById("remedial").value;

  // Overall KPI (exclude Profitability – Financials)
  const overall = ((eff + ppl + profOps) / 3).toFixed(2);

  // Build the report HTML
  const reportHTML = `
    <div class="report-dashboard">
      <h2>${company} — Performance Dashboard</h2>
      <p><strong>Month:</strong> ${month} | <strong>Year:</strong> 2025</p>
      <h3>Overall KPI: ${overall}</h3>
      <p>Efficiency: ${eff} / 5</p>
      <p>People: ${ppl} / 5</p>
      <p>Profitability – Operations: ${profOps} / 5</p>
      <p>Profitability – Financials: ${profFin} / 5 (Excluded from overall)</p>
      <h4>Top KPI</h4>
      <p>${topKPI}</p>
      <h4>Underperforming KPI</h4>
      <p>${underKPI}</p>
      <h4>Remedial Action</h4>
      <p>${remedial}</p>
    </div>
  `;

  previewContainer.innerHTML = reportHTML;
  addBtn.disabled = false;
  deleteBtn.disabled = false;
}

addBtn.addEventListener("click", function () {
  const company = document.getElementById("company").value;
  const month = document.getElementById("month").value;
  const reportHTML = previewContainer.innerHTML;

  if (!company || !month || !reportHTML) {
    alert("Please generate a report first.");
    return;
  }

  localStorage.setItem(`report_${company}_${month}`, reportHTML);
  alert("Report saved to homepage!");
});

deleteBtn.addEventListener("click", function () {
  const company = document.getElementById("company").value;
  const month = document.getElementById("month").value;

  localStorage.removeItem(`report_${company}_${month}`);
  alert("Report deleted from homepage!");
});

// ------- Init KPI sidebar -------
function refreshSidebar() {
  const kpis = loadJSON(STORAGE_KEYS.KPI, {});
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  kpiList.innerHTML = '';
  companies.forEach(c=>{
    const val = (kpis[c] ?? '—');
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = c;
    const badge = document.createElement('span');
    badge.className = 'kpi-badge';
    badge.textContent = (typeof val === 'number') ? val.toFixed(2) : val;
    li.appendChild(name);
    li.appendChild(badge);
    kpiList.appendChild(li);
  });
}
refreshSidebar();

// ------- Utilities -------
function clampKPI(n){
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

// Returns [0..100]% for pointer based on KPI out of 5
function kpiToPercent(kpi){
  return (clampKPI(kpi) / 5) * 100;
}

function makeStars(scoreOutOf5){
  const full = Math.floor(clampKPI(scoreOutOf5));
  const half = (scoreOutOf5 - full) >= 0.5 ? 1 : 0; // visual: we will just fill or not (no half shape)
  const total = Math.min(5, full + half);
  let html = '';
  for (let i=0;i<5;i++){
    html += `<div class="star ${i<total ? 'on':''}"></div>`;
  }
  return html;
}

// Build chart canvas (Chart.js)
function buildChartCanvas(id){
  return `<canvas id="${id}" height="140"></canvas>`;
}

// Build the full HTML report string
function buildReportHTML({
  company, month, eff, ppl, pOps, pFin, overall, topKPI, underPerf, remedial, companyKpiMap
}){
  const pointerLeft = kpiToPercent(overall);
  const stars = makeStars(overall);

  // side list with latest KPI per company
  const sideItems = Object.entries(companyKpiMap).map(([name, val])=>{
    const display = typeof val === 'number' ? val.toFixed(2) : '—';
    return `<li><span>${name}</span><strong>${display}</strong></li>`;
  }).join('');

  return `
  <div class="report-doc" data-company="${company}" data-month="${month}">
    <div class="report-head">
      <div class="meta">
        <div class="title">${company} — Performance Dashboard</div>
        <div class="sub">Month: ${month} &nbsp;•&nbsp; Year: 2025</div>
      </div>
      <img class="brandmark" src="../assets/adnoc-logo.png" alt="ADNOC">
    </div>

    <div class="report-body">
      <!-- Left -->
      <div class="panel-col">
        <div class="panel kpi-overall">
          <div>
            <h4>Overall KPI</h4>
            <div class="kpi-bar">
              <div class="seg bad"></div>
              <div class="seg mid"></div>
              <div class="seg good"></div>
              <div class="kpi-pointer" style="left:${pointerLeft}%"></div>
            </div>
            <div class="star-row">${stars}</div>
          </div>
          <div class="kpi-score">${overall.toFixed(2)}</div>
        </div>

        <div class="panel">
          <h4>Pillars (0–5)</h4>
          <div class="pillar-grid">
            <div class="pillar">
              <div class="label">Efficiency</div>
              <div class="val">${eff.toFixed(2)}</div>
            </div>
            <div class="pillar">
              <div class="label">People</div>
              <div class="val">${ppl.toFixed(2)}</div>
            </div>
            <div class="pillar">
              <div class="label">Profitability – Operations</div>
              <div class="val">${pOps.toFixed(2)}</div>
            </div>
          </div>
          <div style="margin-top:10px; color:#6b7a90; font-size:12px;">
            <strong>Note:</strong> Profitability – Financials (${pFin.toFixed(2)}) is excluded from overall KPI.
          </div>
        </div>

        <div class="panel chart-panel">
          <h4>KPI Trend (Jan–Dec)</h4>
          ${buildChartCanvas('trendChart')}
          <div class="legend">
            <span class="dot actual"></span> Actual
            <span class="dot proj"></span> Projection
          </div>
        </div>

        <div class="panel">
          <div class="narrative-grid">
            <div class="narrative">
              <div class="h">Top KPI</div>
              <div>${topKPI || '—'}</div>
            </div>
            <div class="narrative">
              <div class="h">Underperforming</div>
              <div>${underPerf || '—'}</div>
            </div>
            <div class="narrative">
              <div class="h">Remedial Action</div>
              <div>${remedial || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="side-panel">
        <h4>Company KPI (Latest)</h4>
        <ul class="side-list">
          ${sideItems}
        </ul>
      </div>
    </div>

    <div class="report-foot">
      <span>Generated on ${new Date().toLocaleString()}</span>
      <a href="#" rel="noopener">Visit KPI Portal</a>
    </div>
  </div>
  `;
}

// Build company KPI map for right list using stored latest KPIs
function makeCompanyKpiMap(currentCompany, currentValue){
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  const kpis = loadJSON(STORAGE_KEYS.KPI, {});
  const map = {};
  companies.forEach(c=>{
    map[c] = (c === currentCompany) ? currentValue : (kpis[c] ?? '—');
  });
  return map;
}

// Draw trend chart: actuals (solid blue), projection (dashed orange)
function renderTrendChart(canvasId, company, month, overall){
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const monthIndexMap = {
    January:0, February:1, March:2, April:3, May:4, June:5,
    July:6, August:7, September:8, October:9, November:10, December:11
  };
  const idx = monthIndexMap[month] ?? 0;

  // Gather historical actuals from saved reports for that company (overall KPI)
  const reports = loadJSON(STORAGE_KEYS.REPORTS, {});
  const months = Object.keys(monthIndexMap);
  const actual = new Array(12).fill(null);

  if (reports[company]){
    months.forEach((m,i)=>{
      const html = reports[company][m];
      if (html){
        // Try to parse overall KPI from stored report HTML (we embedded the score)
        const match = html.match(/<div class="kpi-score">([\d.]+)<\/div>/);
        if (match){ actual[i] = parseFloat(match[1]); }
      }
    });
  }
  // Set current month to this overall
  actual[idx] = overall;

  // Build simple projection: hold last actual then gentle slope
  const projection = new Array(12).fill(null);
  let last = overall;
  for (let i = idx+1; i < 12; i++){
    last = Math.max(0, Math.min(5, last + (Math.random()*0.2 - 0.05))); // subtle drift
    projection[i] = last;
  }

  // Chart.js line
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Actual',
          data: actual,
          borderWidth: 3,
          tension: 0.35,
          spanGaps: true,
        },
        {
          label: 'Projection',
          data: projection,
          borderWidth: 2,
          borderDash: [6,6],
          tension: 0.35,
          spanGaps: true,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          min: 0, max: 5, ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// ------- Generate click -------
generateBtn.addEventListener('click', () => {
  const company = companyEl.value;
  const month = monthEl.value;
  if (!company || !month){
    alert('Please select a Company and Month.');
    return;
  }

  const eff = clampKPI(parseFloat(efficiencyEl.value));
  const ppl = clampKPI(parseFloat(peopleEl.value));
  const pOps = clampKPI(parseFloat(profitOpsEl.value));
  const pFin = clampKPI(parseFloat(profitFinEl.value)); // excluded
  // Overall = average of three pillars (exclude Financials)
  const overall = clampKPI((eff + ppl + pOps) / 3);

  // Build KPI side map
  const sidebarMap = makeCompanyKpiMap(company, overall);

  // Build HTML
  const html = buildReportHTML({
    company, month, eff, ppl, pOps, pFin, overall,
    topKPI: topKPIEl.value.trim(),
    underPerf: underPerfEl.value.trim(),
    remedial: remedialEl.value.trim(),
    companyKpiMap: sidebarMap
  });

  preview.innerHTML = html;

  // Render the chart
  renderTrendChart('trendChart', company, month, overall);

  // Enable actions
  saveHomeBtn.disabled = false;
  deletePreviewBtn.disabled = false;
});

// ------- Save to Homepage (localStorage) -------
saveHomeBtn.addEventListener('click', () => {
  const reportEl = preview.querySelector('.report-doc');
  if (!reportEl){
    alert('No report to save. Please generate first.');
    return;
  }
  const company = reportEl.getAttribute('data-company');
  const month = reportEl.getAttribute('data-month');
  const html = reportEl.outerHTML;

  // Save report content
  const reports = loadJSON(STORAGE_KEYS.REPORTS, {});
  if (!reports[company]) reports[company] = {};
  reports[company][month] = html;
  saveJSON(STORAGE_KEYS.REPORTS, reports);

  // Mark latest month
  const latest = loadJSON(STORAGE_KEYS.LATEST, {});
  latest[company] = month;
  saveJSON(STORAGE_KEYS.LATEST, latest);

  // Update latest KPI
  const overallMatch = html.match(/<div class="kpi-score">([\d.]+)<\/div>/);
  const kpiNum = overallMatch ? parseFloat(overallMatch[1]) : null;
  const kpis = loadJSON(STORAGE_KEYS.KPI, {});
  if (typeof kpiNum === 'number') {
    kpis[company] = kpiNum;
    saveJSON(STORAGE_KEYS.KPI, kpis);
  }

  refreshSidebar();
  alert('Report saved to Homepage data.');
});

// ------- Delete preview -------
deletePreviewBtn.addEventListener('click', () => {
  preview.innerHTML = '<div class="empty-state">Fill the form and click “Generate Report” to see a live preview.</div>';
  saveHomeBtn.disabled = true;
  deletePreviewBtn.disabled = true;
});

// ------- Reset form -------
resetBtn.addEventListener('click', () => {
  document.querySelector('.form-grid').querySelectorAll('input, textarea, select').forEach(el=>{
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  deletePreviewBtn.click();
});
