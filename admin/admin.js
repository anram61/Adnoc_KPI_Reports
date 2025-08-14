// ====== Elements ======
const companyEl = document.getElementById('company');
const monthEl = document.getElementById('month');
const efficiencyEl = document.getElementById('efficiency');
const peopleEl = document.getElementById('people');
const profitOpsEl = document.getElementById('profitOps');
const profitFinEl = document.getElementById('profitFin');
const topKPIEl = document.getElementById('topKPI');
const underPerfEl = document.getElementById('underPerf');
const remedialEl = document.getElementById('remedial');
const generateBtn = document.getElementById('generate');
const preview = document.getElementById('reportPreview');

// ====== Storage Helpers ======
function storageKey(company, month) { return `kpi-report::${company}::${month}`; }
function saveReportToStorage(company, month, html) {
  localStorage.setItem(storageKey(company, month), html);
  const latestMap = JSON.parse(localStorage.getItem('kpi-latest') || '{}');
  latestMap[company] = month;
  localStorage.setItem('kpi-latest', JSON.stringify(latestMap));
}

// ====== Build Report HTML ======
function buildReportHTML({company, month, eff, ppl, pOps, pFin, topKPI, underPerf, remedial}) {
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
          <div class="panel">
            <h4>Pillars (0–5)</h4>
            <div class="pillar-grid">
              <div class="pillar"><div class="label">Efficiency</div><div class="val">${eff}</div></div>
              <div class="pillar"><div class="label">People</div><div class="val">${ppl}</div></div>
              <div class="pillar"><div class="label">Profitability – Operations</div><div class="val">${pOps}</div></div>
              <div class="pillar"><div class="label">Profitability – Financials</div><div class="val">${pFin}</div></div>
            </div>
          </div>
          <div class="panel">
            <div class="narrative-grid">
              <div class="narrative"><div class="h">Top KPI</div><div>${topKPI}</div></div>
              <div class="narrative"><div class="h">Underperforming</div><div>${underPerf}</div></div>
              <div class="narrative"><div class="h">Remedial Action</div><div>${remedial}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ====== Generate & Save ======
generateBtn.addEventListener('click', () => {
  const company = companyEl.value;
  const month = monthEl.value;
  if (!company || !month) { alert('Select Company and Month'); return; }

  const html = buildReportHTML({
    company, month,
    eff: parseFloat(efficiencyEl.value),
    ppl: parseFloat(peopleEl.value),
    pOps: parseFloat(profitOpsEl.value),
    pFin: parseFloat(profitFinEl.value),
    topKPI: topKPIEl.value.trim(),
    underPerf: underPerfEl.value.trim(),
    remedial: remedialEl.value.trim()
  });

  preview.innerHTML = html;
  saveReportToStorage(company, month, html);
  alert(`Report saved for ${company} - ${month}`);
});
