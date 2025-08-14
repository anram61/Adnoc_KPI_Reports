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
const el = (id) => document.getElementById(id);
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

// ------- Utilities -------
function clampKPI(n){ return isNaN(n)?0:Math.max(0,Math.min(5,n)); }
function kpiToPercent(kpi){ return (clampKPI(kpi)/5)*100; }
function makeStars(score){ const full=Math.floor(clampKPI(score)), half=(score-full)>=0.5?1:0, total=Math.min(5, full+half); let html=''; for(let i=0;i<5;i++){ html+=`<div class="star ${i<total?'on':''}"></div>`;} return html; }
function buildChartCanvas(id){ return `<canvas id="${id}" height="140"></canvas>`; }

// Build report HTML
function buildReportHTML({company, month, eff, ppl, pOps, pFin, overall, topKPI, underPerf, remedial, companyKpiMap, graphMonths}){
  const pointerLeft = kpiToPercent(overall);
  const stars = makeStars(overall);
  const sideItems = Object.entries(companyKpiMap).map(([name,val])=>`<li><span>${name}</span><strong>${typeof val==='number'?val.toFixed(2):val}</strong></li>`).join('');
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
          <div style="margin-top:10px; color:#6b7a90; font-size:12px;"><strong>Note:</strong> Overall KPI excludes Financials.</div>
        </div>
        <div class="panel chart-panel">
          <h4>KPI Trend (${graphMonths||'Jan–Dec'})</h4>
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

// Company KPI map
function makeCompanyKpiMap(currentCompany, currentValue){
  const companies = ['Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling','Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge','Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc LNG','Adnoc Gas','Year to date Average'];
  const kpis = loadJSON(STORAGE_KEYS.KPI,{});
  const map = {};
  companies.forEach(c=>map[c]=c===currentCompany?currentValue:(kpis[c]??'—'));
  return map;
}

// Render trend chart
function renderTrendChart(canvasId, monthsStr, actualData){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;
  const allMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthsInput = monthsStr?monthsStr.split(',').map(m=>m.trim()):allMonths.slice(0,actualData.length);
  const data = allMonths.map(m=>{
    const idx = monthsInput.indexOf(m);
    return idx>=0?actualData[idx]:null;
  });

  new Chart(ctx,{type:'line',data:{labels:allMonths,datasets:[{label:'Actual',data:data,borderColor:'#1d7ed6',borderWidth:3,tension:0.35,spanGaps:true},{label:'Projection',data:data.map(v=>v?v+0.1:null),borderColor:'#ff7b23',borderWidth:2,borderDash:[6,6],tension:0.35,spanGaps:true}]},options:{responsive:true,plugins:{legend:{display:false},tooltip:{enabled:true}},scales:{y:{min:0,max:5,stepSize:1}}}});
}

// ------- Generate click -------
generateBtn.addEventListener('click',()=>{
  const company = companyEl.value, month = monthEl.value, graphMonths = monthsInputEl?.value||'';
  if(!company||!month){alert('Select Company & Month'); return;}
  const eff=clampKPI(parseFloat(efficiencyEl.value)), ppl=clampKPI(parseFloat(peopleEl.value)), pOps=clampKPI(parseFloat(profitOpsEl.value)), pFin=clampKPI(parseFloat(profitFinEl.value));
  const overall = clampKPI((eff+ppl+pOps)/3);
  const sidebarMap = makeCompanyKpiMap(company,overall);
  const html = buildReportHTML({company,month,eff,ppl,pOps,pFin,overall,topKPI:topKPIEl.value.trim(),underPerf:underPerfEl.value.trim(),remedial:remedialEl.value.trim(),companyKpiMap:sidebarMap,graphMonths});
  preview.innerHTML=html;
  renderTrendChart('trendChart',graphMonths,[eff,ppl,pOps]);
  saveHomeBtn.disabled=false;
  deletePreviewBtn.disabled=false;

  // Save to localStorage
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
});

// Save to homepage
saveHomeBtn.addEventListener('click',()=>{
  const reports=loadJSON(STORAGE_KEYS.REPORTS,{});
  Object.entries(reports).forEach(([company,months])=>{
    Object.entries(months).forEach(([month,html])=>{
      const container=document.createElement('div');
      container.innerHTML=html;
      document.body.appendChild(container.firstElementChild);
    });
  });
  alert('All reports saved to homepage!');
});

// Delete preview
deletePreviewBtn.addEventListener('click',()=>{
  preview.innerHTML='';
  saveHomeBtn.disabled=true;
  deletePreviewBtn.disabled=true;
});
