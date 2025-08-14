// ------- Storage helpers -------
const ADMIN_STORAGE_KEYS = {
  KPI: 'adnoc_kpi_scores' // keep admin sidebar KPI scores as before
};

// Viewer-compatible keys (so index page can read what admin saves)
function viewerStorageKey(company, month) {
  return `kpi-report::${company}::${month}`;
}
const VIEWER_LATEST_KEY = 'kpi-latest';

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
const monthsInputEl = el('graphMonths'); // comma-separated months for the chart
const efficiencyEl = el('efficiency');
const peopleEl = el('people');
const profitOpsEl = el('profitOps');
const profitFinEl = el('profitFin'); // visible but excluded from overall
const topKPIEl = el('topKPI');
const underPerfEl = el('underPerf');
const remedialEl = el('remedial');

const generateBtn = el('generate');
const resetBtn = el('resetForm');
const saveHomeBtn = el('saveHome');
const deletePreviewBtn = el('deletePreview');
const preview = el('reportPreview');
const kpiList = el('companyKpiList');

// ------- KPI sidebar -------
function refreshSidebar() {
  const kpis = loadJSON(ADMIN_STORAGE_KEYS.KPI, {});
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  kpiList.innerHTML = '';
  companies.forEach(c => {
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
function kpiToPercent(kpi){ return (clampKPI(kpi) / 5) * 100; }
function makeStars(scoreOutOf5){
  const full = Math.floor(clampKPI(scoreOutOf5));
  const half = (scoreOutOf5 - full) >= 0.5 ? 1 : 0;
  const total = Math.min(5, full + half);
  let html = '';
  for (let i=0;i<5;i++){
    html += `<div class="star ${i<total ? 'on':''}"></div>`;
  }
  return html;
}
function buildChartCanvas(id){
  return `<div class="chart-wrap"><canvas id="${id}"></canvas></div>`;
}
function normMonths(str){
  if (!str || !str.trim()) {
    return ["January","February","March","April","May","June","July","August","September","October","November","December"];
  }
  return str.split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(s => {
              const m = s.toLowerCase();
              const map = {
                jan:'January', feb:'February', mar:'March', apr:'April', may:'May', jun:'June',
                jul:'July', aug:'August', sep:'September', sept:'September', oct:'October', nov:'November', dec:'December'
              };
              return map[m.slice(0,3)] || (s[0].toUpperCase()+s.slice(1));
            });
}

// Build company KPI map for the right sidebar inside the report
function makeCompanyKpiMap(currentCompany, currentValue){
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  const kpis = loadJSON(ADMIN_STORAGE_KEYS.KPI, {});
  const map = {};
  companies.forEach(c => { map[c] = (c === currentCompany) ? currentValue : (kpis[c] ?? '—'); });
  return map;
}

// ------- Report HTML -------
function buildReportHTML({
  company, month, eff, ppl, pOps, pFin, overall, topKPI, underPerf, remedial, companyKpiMap, graphMonths
}){
  const pointerLeft = kpiToPercent(overall);
  const stars = makeStars(overall);
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
            <div class="pillar"><div class="label">Efficiency</div><div class="val">${eff.toFixed(2)}</div></div>
            <div class="pillar"><div class="label">People</div><div class="val">${ppl.toFixed(2)}</div></div>
            <div class="pillar"><div class="label">Profitability – Operations</div><div class="val">${pOps.toFixed(2)}</div></div>
            <div class="pillar"><div class="label">Profitability – Financials</div><div class="val">${pFin.toFixed(2)}</div></div>
          </div>
          <div class="muted" style="margin-top:10px"><strong>Note:</strong> Overall KPI excludes Financials.</div>
        </div>

        <div class="panel chart-panel">
          <h4>KPI Trend (${graphMonths && graphMonths.trim() ? graphMonths : "Jan–Dec"})</h4>
          ${buildChartCanvas('trendChart')}
          <div class="legend">
            <span class="dot actual"></span> Actual
            <span class="dot proj"></span> Projection
          </div>
        </div>

        <div class="panel">
          <div class="narrative-grid">
            <div class="narrative"><div class="h">Top KPI</div><div>${topKPI || '—'}</div></div>
            <div class="narrative"><div class="h">Underperforming</div><div>${underPerf || '—'}</div></div>
            <div class="narrative"><div class="h">Remedial Action</div><div>${remedial || '—'}</div></div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="side-panel">
        <h4>Company KPI (Latest)</h4>
        <ul class="side-list">${sideItems}</ul>
      </div>
    </div>

    <div class="report-foot">
      <span>Generated on ${new Date().toLocaleString()}</span>
      <a href="#" rel="noopener">Visit KPI Portal</a>
    </div>
  </div>`;
}

// ------- Chart (single instance) -------
let trendChartInstance = null;
function renderTrendChart(canvasId, company, monthsStr, overall){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = normMonths(monthsStr);
  const actual = labels.map(() => overall);
  const projection = labels.map((_, i) => Math.max(0, Math.min(5, overall + (i * 0.05))));

  if (trendChartInstance) {
    trendChartInstance.destroy();
    trendChartInstance = null;
  }

  trendChartInstance = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Actual', data:actual, borderWidth:3, tension:0.35, spanGaps:true, pointRadius:3 },
        { label:'Projection', data:projection, borderWidth:2, borderDash:[6,6], tension:0.35, spanGaps:true, pointRadius:0 }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false, // let CSS control height so labels fit
      indexAxis:'x',             // ensure months are on X
      plugins:{ legend:{display:false}, tooltip:{enabled:true} },
      layout:{ padding:{ right:8, left:8 } },
      scales:{
        x:{
          ticks:{ autoSkip:false, maxRotation:0, minRotation:0, padding:6 }
        },
        y:{
          min:0, max:5, ticks:{ stepSize:1 }
        }
      },
      animation:{ duration:300 }
    }
  });
}

// ------- Save helpers (viewer-compatible) -------
function saveReportForViewer(company, month, html) {
  // save the report HTML under the exact key the viewer reads
  localStorage.setItem(viewerStorageKey(company, month), html);

  // update latest map the way the viewer expects: { [company]: { month } }
  const latestMap = loadJSON(VIEWER_LATEST_KEY, {});
  latestMap[company] = { month };
  saveJSON(VIEWER_LATEST_KEY, latestMap);
}

function deleteReportForViewer(company, month) {
  localStorage.removeItem(viewerStorageKey(company, month));
  const latestMap = loadJSON(VIEWER_LATEST_KEY, {});
  if (latestMap[company]?.month === month) {
    delete latestMap[company];
    saveJSON(VIEWER_LATEST_KEY, latestMap);
  }
}

// ------- Generate click -------
generateBtn.addEventListener('click', () => {
  const company = companyEl.value;
  const month = monthEl.value;
  const graphMonths = monthsInputEl?.value || "";

  if (!company || !month){
    alert('Please select a Company and Month.');
    return;
  }

  const eff = clampKPI(parseFloat(efficiencyEl.value));
  const ppl = clampKPI(parseFloat(peopleEl.value));
  const pOps = clampKPI(parseFloat(profitOpsEl.value));
  const pFin = clampKPI(parseFloat(profitFinEl.value));
  const overall = clampKPI((eff + ppl + pOps)/3);

  const sidebarMap = makeCompanyKpiMap(company, overall);

  const html = buildReportHTML({
    company, month, eff, ppl, pOps, pFin, overall,
    topKPI: topKPIEl.value.trim(),
    underPerf: underPerfEl.value.trim(),
    remedial: remedialEl.value.trim(),
    companyKpiMap: sidebarMap,
    graphMonths
  });

  // Inject preview HTML
  preview.innerHTML = html;

  // Render chart after DOM injection
  renderTrendChart('trendChart', company, graphMonths, overall);

  // enable actions
  saveHomeBtn.disabled = false;
  deletePreviewBtn.disabled = false;

  // Update Admin KPI sidebar immediately
  const kpis = loadJSON(ADMIN_STORAGE_KEYS.KPI, {});
  kpis[company] = overall;
  saveJSON(ADMIN_STORAGE_KEYS.KPI, kpis);
  refreshSidebar();

  // Also pre-save for the viewer so it appears immediately on the homepage
  saveReportForViewer(company, month, html);
});

// ------- Save to Homepage (explicit) -------
saveHomeBtn.addEventListener('click', () => {
  const company = companyEl.value;
  const month = monthEl.value;
  if (!company || !month) {
    alert('Please generate a report first.');
    return;
  }
  const doc = preview.querySelector('.report-doc');
  if (!doc) {
    alert('Nothing to save — please Generate Report.');
    return;
  }
  saveReportForViewer(company, month, preview.innerHTML);
  alert(`Report for ${company} (${month} 2025) saved to homepage.`);
});

// ------- Delete Report -------
deletePreviewBtn.addEventListener('click', () => {
  const company = companyEl.value;
  const month = monthEl.value;
  if (!company || !month) {
    alert('Please select Company & Month to delete.');
    return;
  }

  // Remove from viewer storage
  deleteReportForViewer(company, month);

  // Clear preview
  preview.innerHTML = '<div class="empty-state">Report deleted. Generate a new report to preview.</div>';
  saveHomeBtn.disabled = true;
  deletePreviewBtn.disabled = true;

  // Update Admin KPI sidebar
  const kpis = loadJSON(ADMIN_STORAGE_KEYS.KPI, {});
  if (kpis[company]) { delete kpis[company]; saveJSON(ADMIN_STORAGE_KEYS.KPI, kpis); }
  refreshSidebar();

  alert(`Report deleted for ${company} (${month} 2025).`);
});

// ------- Reset form -------
resetBtn.addEventListener('click', () => {
  setTimeout(() => {
    preview.innerHTML = '<div class="empty-state">Fill the form and click “Generate Report” to see a live preview.</div>';
    if (trendChartInstance) { trendChartInstance.destroy(); trendChartInstance = null; }
    saveHomeBtn.disabled = true;
    deletePreviewBtn.disabled = true;
  }, 0);
});
