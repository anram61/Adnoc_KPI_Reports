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
    const val = kpis[c] ?? '—';
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
function clampKPI(n){ return isNaN(n)?0:Math.max(0,Math.min(5,n)); }
function kpiToPercent(kpi){ return (clampKPI(kpi)/5)*100; }

function makeStars(scoreOutOf5){
  const full = Math.floor(clampKPI(scoreOutOf5));
  const half = (scoreOutOf5-full)>=0.5?1:0;
  const total = Math.min(5, full+half);
  let html='';
  for(let i=0;i<5;i++) html += `<div class="star ${i<total?'on':''}"></div>`;
  return html;
}

// Build chart canvas
function buildChartCanvas(id){
  return `<canvas id="${id}" height="140"></canvas>`;
}

// Build report HTML
function buildReportHTML({
  company, month, eff, ppl, pOps, pFin, overall, topKPI, underPerf, remedial, companyKpiMap, graphMonths
}){
  const pointerLeft = kpiToPercent(overall);
  const stars = makeStars(overall);

  // Sidebar inside report
  const sideItems = Object.entries(companyKpiMap).map(([name,val])=>{
    const display = typeof val==='number'?val.toFixed(2):'—';
    return `<li><span>${name}</span><strong>${display}</strong></li>`;
  }).join('');

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
          <div style="margin-top:10px; font-size:12px; color:#6b7a90;"><strong>Note:</strong> Overall KPI excludes Financials.</div>
        </div>

        <div class="panel chart-panel">
          <h4>KPI Trend (${graphMonths||"Jan–Dec"})</h4>
          ${buildChartCanvas('trendChart')}
        </div>

        <div class="panel">
          <div class="narrative-grid">
            <div class="narrative"><div class="h">Top KPI</div><div>${topKPI||'—'}</div></div>
            <div class="narrative"><div class="h">Underperforming</div><div>${underPerf||'—'}</div></div>
            <div class="narrative"><div class="h">Remedial Action</div><div>${remedial||'—'}</div></div>
          </div>
        </div>
      </div>

      <div class="side-panel">
        <h4>Company KPI (Latest)</h4>
        <ul class="side-list">${sideItems}</ul>
      </div>
    </div>

    <div class="report-foot">
      <span>Generated on ${new Date().toLocaleString()}</span>
      <a href="#" rel="noopener">Visit KPI Portal</a>
    </div>
  </div>
  `;
}

// Build company KPI map
function makeCompanyKpiMap(currentCompany, currentValue){
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'
  ];
  const kpis = loadJSON(STORAGE_KEYS.KPI,{});
  const map={};
  companies.forEach(c=>{
    map[c] = (c===currentCompany)?currentValue:(kpis[c]??'—');
  });
  return map;
}

// Render trend chart
function renderTrendChart(canvasId, monthsStr, values){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;

  const months = monthsStr? monthsStr.split(',').map(m=>m.trim()) :
    ["January","February","March","April","May","June","July","August","September","October","November","December"];

  new Chart(ctx,{
    type:'line',
    data:{
      labels:months,
      datasets:[
        { label:'KPI', data:values, borderColor:'#1d7ed6', backgroundColor:'rgba(29,126,214,0.2)', fill:true, tension:0.3, pointRadius:4 }
      ]
    },
    options:{
      responsive:true,
      plugins:{ legend:{display:false} },
      scales:{ y:{ min:0, max:5, ticks:{ stepSize:1 } } }
    }
  });
}

// ------- Generate click -------
generateBtn.addEventListener('click',()=>{
  const company=companyEl.value;
  const month=monthEl.value;
  const graphMonths=monthsInputEl?.value || "";

  if(!company||!month){ alert('Select Company and Month'); return; }

  const eff=clampKPI(parseFloat(efficiencyEl.value));
  const ppl=clampKPI(parseFloat(peopleEl.value));
  const pOps=clampKPI(parseFloat(profitOpsEl.value));
  const pFin=clampKPI(parseFloat(profitFinEl.value));

  const overall=clampKPI((eff+ppl+pOps)/3);
  const sidebarMap=makeCompanyKpiMap(company,overall);

  const html=buildReportHTML({company,month,eff,ppl,pOps,pFin,overall,
    topKPI:topKPIEl.value.trim(),
    underPerf:underPerfEl.value.trim(),
    remedial:remedialEl.value.trim(),
    companyKpiMap:sidebarMap,
    graphMonths
  });

  preview.innerHTML=html;

  // render chart
  const chartMonths = graphMonths? graphMonths.split(',').map(m=>m.trim()):["January","February","March","April","May","June"];
  const chartValues = chartMonths.map(()=>overall); // simple line
  renderTrendChart('trendChart', chartMonths.join(','), chartValues);

  saveHomeBtn.disabled=false;
  deletePreviewBtn.disabled=false;

  // save report
  const reports=loadJSON(STORAGE_KEYS.REPORTS,{});
  if(!reports[company]) reports[company]={};
  reports[company][month]=html;
  saveJSON(STORAGE_KEYS.REPORTS,reports);

  const latest=loadJSON(STORAGE_KEYS.LATEST,{});
  latest[company]=month;
  saveJSON(STORAGE_KEYS.LATEST,latest);

  const kpis=loadJSON(STORAGE_KEYS.KPI,{});
  kpis[company]=overall;
  saveJSON(STORAGE_KEYS.KPI,kpis);

  refreshSidebar();
});

// ------- Save to Homepage -------
saveHomeBtn.addEventListener('click',()=>{
  const reportDiv=preview.querySelector('.report-doc');
  if(!reportDiv) return;
  alert('Report saved successfully.');
});

// ------- Delete preview -------
deletePreviewBtn.addEventListener('click',()=>{
  preview.innerHTML='<div class="empty-state">Fill the form and click “Generate Report” to see a live preview.</div>';
  saveHomeBtn.disabled=true;
  deletePreviewBtn.disabled=true;
});
