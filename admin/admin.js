// ------- Admin Page Script -------

// Storage helpers
const STORAGE_KEYS = {
  REPORTS: 'adnoc_reports',
  LATEST: 'adnoc_latest',
  KPI: 'adnoc_kpi_scores'
};
function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// Elements
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
const saveHomeBtn = el('saveHome');
const deletePreviewBtn = el('deletePreview');
const preview = el('reportPreview');

function clampKPI(n){ return isNaN(n)?0:Math.max(0, Math.min(5,n)); }
function kpiToPercent(kpi){ return (clampKPI(kpi)/5)*100; }

function makeStars(scoreOutOf5){
  const full = Math.floor(clampKPI(scoreOutOf5));
  const half = (scoreOutOf5-full)>=0.5?1:0;
  const total = Math.min(5, full+half);
  let html='';
  for(let i=0;i<5;i++){ html+=`<div class="star ${i<total?'on':''}"></div>`; }
  return html;
}

function buildChartCanvas(id){ return `<canvas id="${id}" height="140"></canvas>`; }

function buildReportHTML({company, month, eff, ppl, pOps, pFin, overall, topKPI, underPerf, remedial, companyKpiMap, graphMonths}){
  const pointerLeft = Math.min(kpiToPercent(overall), 100);
  const stars = makeStars(overall);
  const sideItems = Object.entries(companyKpiMap).map(([name,val])=>{
    let cls='kpi-blue';
    if(typeof val==='number'){
      if(val>=4) cls='kpi-green';
      else if(val>=3) cls='kpi-amber';
      else cls='kpi-red';
    }
    const display=typeof val==='number'?val.toFixed(2):'—';
    return `<li><span>${name}</span><strong class="${cls}">${display}</strong></li>`;
  }).join('');

  return `
<div class="report-doc" data-company="${company}" data-month="${month}">
  <div class="report-head">
    <div class="meta">
      <div class="title">${company} — Performance Dashboard</div>
      <div class="sub">Month: ${month} • Year: 2025</div>
    </div>
    <img class="brandmark" src="/assets/adnoc-logo.png" alt="ADNOC">
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
</div>
  `;
}

function makeCompanyKpiMap(currentCompany, currentValue){
  const companies = [
    'Adnoc Onshore','Adnoc Offshore','Adnoc Al Dhafra & Al Yasat','Adnoc Drilling',
    'Adnoc Sour Gas','Adnoc Refining','Adnoc Distribution','Adnoc Borouge',
    'Adnoc L&S','Adnoc Global Trading','GBDO','Adnoc Gas','Year to date Average'
  ];
  const kpis = loadJSON(STORAGE_KEYS.KPI,{});
  const map={};
  companies.forEach(c=>{ map[c]= (c===currentCompany)?currentValue:(kpis[c]??'—'); });
  return map;
}

function renderTrendChart(canvasId, company, monthsStr, overall){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;

  const allMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const inputVals = monthsStr ? monthsStr.split(',').map(v => clampKPI(parseFloat(v.trim()))) : [];
  const actual = allMonths.map((_, i) => inputVals[i] ?? 0);
  const projection = allMonths.map((_, i) => (actual[i] || 0) + 0.1 * i);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: allMonths,
      datasets: [
        { label: 'Actual', data: actual, borderColor: '#0066cc', backgroundColor: 'rgba(0,102,204,0.2)',
          borderWidth: 3, tension:0.35, spanGaps:true, pointRadius:6, pointBackgroundColor:'#0066cc' },
        { label: 'Projection', data: projection, borderColor: '#00cc66', borderWidth: 2, borderDash:[6,6],
          tension:0.35, spanGaps:true, pointRadius:0 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend:{display:false}, tooltip:{enabled:true} },
      scales:{
        x:{ title:{display:true,text:'Month'} },
        y:{ min:0, max:5, ticks:{stepSize:1}, title:{display:true,text:'KPI Score (0–5)'} }
      }
    }
  });
}

// Generate report
generateBtn.addEventListener('click',()=>{
  const company=companyEl.value;
  const month=monthEl.value;
  const graphMonths=monthsInputEl?.value || "";
  if(!company||!month){alert('Select Company and Month');return;}

  const eff=clampKPI(parseFloat(efficiencyEl.value));
  const ppl=clampKPI(parseFloat(peopleEl.value));
  const pOps=clampKPI(parseFloat(profitOpsEl.value));
  const pFin=clampKPI(parseFloat(profitFinEl.value));
  const overall=clampKPI((eff+ppl+pOps)/3);

  const sidebarMap=makeCompanyKpiMap(company,overall);

  const html=buildReportHTML({
    company,month,eff,ppl,pOps,pFin,overall,
    topKPI:topKPIEl.value.trim(),
    underPerf:underPerfEl.value.trim(),
    remedial:remedialEl.value.trim(),
    companyKpiMap:sidebarMap,
    graphMonths
  });

  preview.innerHTML=html;
  renderTrendChart('trendChart',company,graphMonths,overall);
  
  saveHomeBtn.disabled=false;
  deletePreviewBtn.disabled=false;
});

  saveHomeBtn.addEventListener('click', () => {
  const report = preview.querySelector('.report-doc');
  if (!report) { alert('No report to save'); return; }

  const company = report.dataset.company;
  const month = report.dataset.month;

  try {
    // Replace Chart.js canvases with images for saving
    report.querySelectorAll('canvas').forEach(canvas => {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');  // capture chart pixels
      img.style.width = canvas.style.width;
      img.style.height = canvas.style.height;
      canvas.replaceWith(img);
    });

    // Save exact HTML to homepage storage
    localStorage.setItem(`kpi-report::${company}::${month}`, report.outerHTML);

    // Update latest map for homepage
    const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
    latestMap[company] = { month };
    localStorage.setItem('kpi-latest', JSON.stringify(latestMap));

    alert(`Report for ${company} - ${month} saved successfully and will display exactly like preview on homepage.`);
  } catch (err) {
    alert('Error saving report: ' + err.message);
  }
});


// Delete preview
deletePreviewBtn.addEventListener('click',()=>{
  preview.innerHTML='';
  saveHomeBtn.disabled=true;
  deletePreviewBtn.disabled=true;
});
