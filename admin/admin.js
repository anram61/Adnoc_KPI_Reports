// ------- Storage helpers -------
const STORAGE_KEYS = {
  REPORTS: 'adnoc_reports',
  LATEST: 'adnoc_latest',
  KPI: 'adnoc_kpi_scores'
};

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ------- Elements -------
const el = id => document.getElementById(id);
const companyEl = el('company');
const monthEl = el('month');
const monthsInputEl = el('graphMonths');
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

// ------- Sidebar -------
function refreshSidebar(){
  const kpis = loadJSON(STORAGE_KEYS.KPI,{});
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  kpiList.innerHTML = '';
  companies.forEach(c=>{
    const val = kpis[c] ?? '—';
    const li = document.createElement('li');
    const name = document.createElement('span'); name.textContent=c;
    const badge = document.createElement('span'); badge.className='kpi-badge';
    badge.textContent = typeof val==='number'?val.toFixed(2):val;
    li.appendChild(name); li.appendChild(badge);
    kpiList.appendChild(li);
  });
}
refreshSidebar();

// ------- Utilities -------
function clampKPI(n){ return isNaN(n)?0:Math.max(0,Math.min(5,n)); }
function kpiToPercent(kpi){ return (clampKPI(kpi)/5)*100; }
function makeStars(score){
  const full = Math.floor(clampKPI(score));
  const half = (score-full)>=0.5?1:0;
  const total = Math.min(5,full+half);
  let html='';
  for(let i=0;i<5;i++){ html+=`<div class="star ${i<total?'on':''}"></div>`;}
  return html;
}
function buildChartCanvas(id){ return `<canvas id="${id}" height="140"></canvas>`; }

function buildReportHTML({company, month, eff, ppl, pOps, pFin, overall, topKPI, underPerf, remedial, companyKpiMap, graphMonths}){
  const pointerLeft = kpiToPercent(overall);
  const stars = makeStars(overall);
  const sideItems = Object.entries(companyKpiMap).map(([n,v])=>`<li><span>${n}</span><strong>${typeof v==='number'?v.toFixed(2):'—'}</strong></li>`).join('');
  return `
  <div class="report-doc" data-company="${company}" data-month="${month}">
    <div class="report-head">
      <div class="meta">
        <div class="title">${company} — Performance Dashboard</div>
        <div class="sub">Month: ${month} • Year: 2025</div>
      </div>
      <img class="brandmark" src="../assets/adnoc-logo.png" alt="ADNOC">
    </div>
    <div class="report-body">
      <div class="panel-col" style="flex:1">
        <div class="panel kpi-overall">
          <div>
            <h4>Overall KPI</h4>
            <div class="kpi-bar">
              <div class="seg bad"></div><div class="seg mid"></div><div class="seg good"></div>
              <div class="kpi-pointer" style="left:${pointerLeft}%"></div>
            </div>
            <div class="star-row">${stars}</div>
          </div>
          <div class="kpi-score">${overall.toFixed(2)}</div>
        </div>
        <div class="panel">
          <h4>Pillars (0–5)</h4>
          <div class="pillar-grid">
            <div class="pillar"><div class="label">Efficiency</div><div class="val">${eff.toFixed(2)}</div></div>
            <div class="pillar"><div class="label">People</div><div class="val">${ppl.toFixed(2)}</div></div>
            <div class="pillar"><div class="label">Profitability – Operations</div><div class="val">${pOps.toFixed(2)}</div></div>
            <div class="pillar"><div class="label">Profitability – Financials</div><div class="val">${pFin.toFixed(2)}</div></div>
          </div>
          <div style="margin-top:10px; color:#6b7a90; font-size:12px;">
            <strong>Note:</strong> Overall KPI excludes Financials.
          </div>
        </div>
        <div class="panel chart-panel">
          <h4>KPI Trend (${graphMonths||"Jan–Dec"})</h4>
          ${buildChartCanvas('trendChart')}
          <div class="legend">
            <span class="dot actual"></span> Actual
            <span class="dot proj"></span> Projection
          </div>
        </div>
        <div class="panel">
          <div class="narrative-grid">
            <div class="narrative"><div class="h">Top KPI</div><div>${topKPI||'—'}</div></div>
            <div class="narrative"><div class="h">Underperforming</div><div>${underPerf||'—'}</div></div>
            <div class="narrative"><div class="h">Remedial Action</div><div>${remedial||'—'}</div></div>
          </div>
        </div>
      </div>
      <div class="side-panel" style="width:250px">${sideItems}</div>
    </div>
    <div class="report-foot"><span>Generated on ${new Date().toLocaleString()}</span><a href="#" rel="noopener">Visit KPI Portal</a></div>
  </div>`;
}

function makeCompanyKpiMap(currentCompany, currentValue){
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  const kpis = loadJSON(STORAGE_KEYS.KPI,{});
  const map = {};
    companies.forEach(c => {
    map[c] = (c === currentCompany) ? currentValue : (kpis[c] ?? '—');
  });
  return map;
}

function renderTrendChart(canvasId, graphMonthsStr, eff, ppl, pOps) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // X-axis labels
  const months = graphMonthsStr 
    ? graphMonthsStr.split(',').map(m=>m.trim())
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Example KPI values for trend (replace with real monthly data if available)
  const overall = (eff + ppl + pOps) / 3;
  const actual = months.map((_, i) => Math.min(5, Math.max(0, overall + (Math.random()-0.5)*0.5)));
  const projection = months.map((_, i) => Math.min(5, Math.max(0, overall + 0.2 + i*0.1)));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Actual',
          data: actual,
          borderColor: '#1d7ed6',
          backgroundColor: 'rgba(29,126,214,0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Projection',
          data: projection,
          borderColor: '#ff7b23',
          borderWidth: 2,
          borderDash: [6,6],
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      },
      scales: {
        y: { 
          min: 0,
          max: 5,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'KPI Score' }
        },
        x: {
          title: { display: true, text: 'Month' }
        }
      }
    }
  });
}


// ------- Event Listeners -------
generateBtn.addEventListener('click', () => {
  const company = companyEl.value;
  const month = monthEl.value;
  const graphMonths = monthsInputEl?.value || "";

  if (!company || !month) { alert('Please select a Company and Month.'); return; }

  const eff = clampKPI(parseFloat(efficiencyEl.value));
  const ppl = clampKPI(parseFloat(peopleEl.value));
  const pOps = clampKPI(parseFloat(profitOpsEl.value));
  const pFin = clampKPI(parseFloat(profitFinEl.value));
  const overall = clampKPI((eff+ppl+pOps)/3);

  const sidebarMap = makeCompanyKpiMap(company, overall);

  const html = buildReportHTML({
    company, month, eff, ppl, pOps, pFin, overall,
    topKPI: topKPIEl.value.trim(),
    underPerf: underPerfEl.value.trim(),
    remedial: remedialEl.value.trim(),
    companyKpiMap: sidebarMap,
    graphMonths
  });

  preview.innerHTML = html;
  renderTrendChart('trendChart', graphMonths, overall);

  saveHomeBtn.disabled = false;
  deletePreviewBtn.disabled = false;
});

// Reset form
resetBtn.addEventListener('click', () => {
  document.querySelectorAll('.form-card input, .form-card textarea, .form-card select').forEach(i => i.value='');
  preview.innerHTML = '<div class="empty-state">Fill the form and click “Generate Report” to see a live preview.</div>';
  saveHomeBtn.disabled = true;
  deletePreviewBtn.disabled = true;
});

saveHomeBtn.addEventListener('click', () => {
  const reportDiv = preview.querySelector('.report-doc');
  if (!reportDiv) return alert('No report to save.');

  const company = reportDiv.dataset.company;
  const month = reportDiv.dataset.month;
  
  // Wrap report in full HTML with CSS
  const htmlToSave = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${company} - ${month} Report</title>
    <link rel="stylesheet" href="../admin.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  </head>
  <body>
    ${reportDiv.outerHTML}
  </body>
  </html>
  `;

  // Save to reports
  const reports = loadJSON(STORAGE_KEYS.REPORTS,{});
  if (!reports[company]) reports[company] = {};
  reports[company][month] = htmlToSave;
  saveJSON(STORAGE_KEYS.REPORTS, reports);

  // Latest month
  const latest = loadJSON(STORAGE_KEYS.LATEST,{});
  latest[company] = month;
  saveJSON(STORAGE_KEYS.LATEST, latest);

  // KPI
  const overall = parseFloat(reportDiv.querySelector('.kpi-score').textContent) || 0;
  const kpis = loadJSON(STORAGE_KEYS.KPI,{});
  kpis[company] = overall;
  saveJSON(STORAGE_KEYS.KPI, kpis);

  refreshSidebar();
  alert(`Report for ${company} (${month}) saved successfully!`);
});



// Delete preview report
deletePreviewBtn.addEventListener('click', () => {
  const reportDiv = preview.querySelector('.report-doc');
  if (!reportDiv) return;

  const company = reportDiv.dataset.company;
  const month = reportDiv.dataset.month;

  const reports = loadJSON(STORAGE_KEYS.REPORTS,{});
  if (reports[company]) delete reports[company][month];
  saveJSON(STORAGE_KEYS.REPORTS, reports);

  preview.innerHTML = '<div class="empty-state">Preview deleted. Generate a new report.</div>';
  saveHomeBtn.disabled = true;
  deletePreviewBtn.disabled = true;
  alert(`Preview report for ${company} (${month}) deleted.`);
});
