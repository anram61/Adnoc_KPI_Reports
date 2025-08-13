// ---- helpers ----
const $ = s => document.querySelector(s);
const latestList = $("#latest-list");
const preview = $("#preview");

const form = {
  company: $("#company"),
  month: $("#month"),
  eff: $("#efficiency"),
  people: $("#people"),
  ops: $("#profitOps"),
  fin: $("#profitFin"),
  top: $("#topKpi"),
  under: $("#underperforming"),
  remedial: $("#remedial"),
};

const btnGenerate = $("#btn-generate");
const btnSaveHome = $("#btn-save-home");
const btnDelete = $("#btn-delete");

// Storage keys
const REPORT_KEY_PREFIX = "kpi-report"; // kpi-report::<company>::<month>
const LATEST_KPI_KEY = "kpi-latest";    // per-company latest KPI

function key(company, month) {
  return `${REPORT_KEY_PREFIX}::${company}::${month}`;
}

// Load latest KPI map
function getLatestMap() {
  try {
    return JSON.parse(localStorage.getItem(LATEST_KPI_KEY) || "{}");
  } catch { return {}; }
}

function setLatest(company, kpi, month) {
  const map = getLatestMap();
  map[company] = { kpi: Number(kpi), month };
  localStorage.setItem(LATEST_KPI_KEY, JSON.stringify(map));
  renderLatest();
}

function deleteLatestIf(company, month) {
  const map = getLatestMap();
  if (map[company] && map[company].month === month) {
    delete map[company];
    localStorage.setItem(LATEST_KPI_KEY, JSON.stringify(map));
  }
  renderLatest();
}

function renderLatest() {
  const map = getLatestMap();
  latestList.innerHTML = "";
  Object.keys(map).sort().forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${c}</strong></span>
      <span class="tag">${map[c].kpi.toFixed(1)} ( ${map[c].month} )</span>
    `;
    latestList.appendChild(li);
  });
}
renderLatest();

// Escape HTML
function escapeHtml(s=""){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// Build monthly chart data
function buildMonthlyBars(currentMonth, currentKPI) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const values = months.map(m => m === currentMonth.slice(0,3) ? currentKPI : 0);
  return { months, values };
}

// Build dashboard HTML
function buildDashboardHTML(data) {
  const { company, month, kpi, eff, people, ops, fin, top, under, remedial } = data;
  const bars = buildMonthlyBars(month, kpi);
  const maxVal = 5; // KPI out of 5
  const h = 160, barW = 20, gap = 14;
  const chartWidth = bars.values.length * (barW + gap) + gap;

  const svgBars = bars.values.map((v, i) => {
    const x = gap + i * (barW + gap);
    const height = Math.round((v / maxVal) * (h - 24));
    const y = h - height - 20;
    const active = v > 0;
    return `
      <rect class="bar" x="${x}" y="${y}" width="${barW}" height="${height}" rx="4" fill="${active ? '#22c55e' : '#e5edf7'}"></rect>
      <text x="${x + barW/2}" y="${h-4}" text-anchor="middle" font-size="10" fill="#374151">${bars.months[i]}</text>
    `;
  }).join("");

  const fillPct = Math.max(0, Math.min(100, (kpi/maxVal)*100));

  return `
  <div class="kpi-card">
    <div class="kpi-header">
      <div>
        <div class="kpi-title">${company} – Performance Dashboard</div>
        <div class="kpi-meta">Month: <strong>${month}</strong></div>
      </div>
      <img src="../assets/adnoc-logo.png" alt="ADNOC" style="height:36px"/>
    </div>

    <div class="kpi-grid">
      <div class="kpi-panel">
        <h3 class="kpi-subtitle">Pillars</h3>
        <div class="kpi-badges">
          <div class="pill eff">
            <label>Efficiency</label>
            <div class="score">${eff.toFixed(1)}</div>
            <div class="bar-wrap"><div class="bar" style="width:${(eff/maxVal)*100}%;"></div></div>
          </div>
          <div class="pill people">
            <label>People</label>
            <div class="score">${people.toFixed(1)}</div>
            <div class="bar-wrap"><div class="bar" style="width:${(people/maxVal)*100}%;"></div></div>
          </div>
          <div class="pill ops">
            <label>Profitability – Operations</label>
            <div class="score">${ops.toFixed(1)}</div>
            <div class="bar-wrap"><div class="bar" style="width:${(ops/maxVal)*100}%;"></div></div>
          </div>
          <div class="pill fin">
            <label>Profitability – Financials</label>
            <div class="score">${fin.toFixed(1)}</div>
            <div class="bar-wrap"><div class="bar" style="width:${(fin/maxVal)*100}%;"></div></div>
          </div>
        </div>

        <div class="kpi-summary" style="margin-top:12px">
          <div class="row"><div class="kpi-tag">Top KPI</div><div class="kpi-text">${escapeHtml(top)}</div></div>
          <div class="row"><div class="kpi-tag">Underperforming</div><div class="kpi-text">${escapeHtml(under)}</div></div>
          <div class="row"><div class="kpi-tag">Remedial Action</div><div class="kpi-text">${escapeHtml(remedial)}</div></div>
        </div>
      </div>

      <div class="kpi-score-wrap">
        <div class="kpi-score-number">${kpi.toFixed(1)}</div>
        <div class="kpi-therm">
          <div class="fill" style="width:${fillPct}%;"></div>
          <div class="ticks">
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span>
          </div>
        </div>
        <div class="kpi-legend">
          <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>

        <div class="kpi-chart">
          <svg viewBox="0 0 ${chartWidth} ${h}">
            ${svgBars}
          </svg>
        </div>
      </div>
    </div>
  </div>
  `;
}

// ---- main actions ----
btnGenerate.addEventListener("click", () => {
  const company = form.company.value.trim();
  const month = form.month.value.trim();
  if (!company || !month) { alert("Please choose company and month."); return; }

  // Safe parsing
  const eff = Math.min(5, Math.max(0, parseFloat(form.eff.value) || 0));
  const people = Math.min(5, Math.max(0, parseFloat(form.people.value) || 0));
  const ops = Math.min(5, Math.max(0, parseFloat(form.ops.value) || 0));
  const fin = Math.min(5, Math.max(0, parseFloat(form.fin.value) || 0));

  const kpi = (eff + people + ops)/3;

  const data = {
    company, month, kpi, eff, people, ops, fin,
    top: form.top.value, under: form.under.value, remedial: form.remedial.value
  };

  try {
    preview.innerHTML = buildDashboardHTML(data);
  } catch(e) {
    console.error("Dashboard build error:", e);
    preview.innerHTML = `<div style="color:red;">Error generating dashboard: ${e.message}</div>`;
    return;
  }

  btnSaveHome.disabled = false;
  btnDelete.disabled = false;

  sessionStorage.setItem("draft-dashboard", JSON.stringify({
    key: key(company, month),
    company, month, html: preview.innerHTML, kpi
  }));
});

btnSaveHome.addEventListener("click", () => {
  const draft = JSON.parse(sessionStorage.getItem("draft-dashboard") || "null");
  if (!draft) { alert("Generate a report first."); return; }

  localStorage.setItem(draft.key, draft.html);
  setLatest(draft.company, draft.kpi, draft.month);

  alert("Report saved and added to homepage for this company/month.");
});

btnDelete.addEventListener("click", () => {
  const company = form.company.value.trim();
  const month = form.month.value.trim();
  if (!company || !month) { alert("Choose company and month to delete."); return; }

  const k = key(company, month);
  if (localStorage.getItem(k)) {
    if (confirm(`Delete saved report for ${company} – ${month}?`)) {
      localStorage.removeItem(k);
      deleteLatestIf(company, month);
      preview.innerHTML = "";
      btnSaveHome.disabled = true;
      btnDelete.disabled = true;
      alert("Report deleted.");
    }
  } else {
    alert("No saved report found for that company/month.");
  }
});
