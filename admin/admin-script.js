// admin.js
window.addEventListener("DOMContentLoaded", () => {
  const preview = document.getElementById("preview");
  const btnGenerate = document.getElementById("btn-generate");
  const btnSaveHome = document.getElementById("btn-save-home");
  const btnDelete = document.getElementById("btn-delete");

  const form = {
    company: document.getElementById("company"),
    month: document.getElementById("month"),
    eff: document.getElementById("efficiency"),
    people: document.getElementById("people"),
    ops: document.getElementById("profitOps"),
    fin: document.getElementById("profitFin"),
    top: document.getElementById("topKpi"),
    under: document.getElementById("underperforming"),
    remedial: document.getElementById("remedial"),
  };

  const REPORT_KEY_PREFIX = "kpi-report";
  const LATEST_KPI_KEY = "kpi-latest";

  const key = (company, month) => `${REPORT_KEY_PREFIX}::${company}::${month}`;

  function escapeHtml(s="") {
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function getLatestMap() {
    try { return JSON.parse(localStorage.getItem(LATEST_KPI_KEY) || "{}"); }
    catch { return {}; }
  }

  function setLatest(company, kpi, month) {
    const map = getLatestMap();
    map[company] = { kpi: Number(kpi), month };
    localStorage.setItem(LATEST_KPI_KEY, JSON.stringify(map));
    renderLatest();
  }

  function deleteLatestIf(company, month) {
    const map = getLatestMap();
    if (map[company] && map[company].month === month) delete map[company];
    localStorage.setItem(LATEST_KPI_KEY, JSON.stringify(map));
    renderLatest();
  }

  const latestList = document.getElementById("latest-list");
  function renderLatest() {
    const map = getLatestMap();
    latestList.innerHTML = "";
    Object.keys(map).sort().forEach(c => {
      const li = document.createElement("li");
      li.innerHTML = `<span><strong>${c}</strong></span><span class="tag">${map[c].kpi.toFixed(1)} (${map[c].month})</span>`;
      latestList.appendChild(li);
    });
  }
  renderLatest();

  function buildDashboardHTML(data) {
    const { company, month, eff, people, ops, fin, top, under, remedial } = data;
    const kpi = (eff + people + ops) / 3;
    const fillPct = (kpi / 5) * 100;

    return `
    <div class="kpi-card">
      <div class="kpi-header">
        <div>
          <div class="kpi-title">${company} – Performance Dashboard</div>
          <div class="kpi-meta">Month: <strong>${month}</strong></div>
        </div>
        <img src="../assets/adnoc-logo.png" style="height:36px"/>
      </div>

      <div class="kpi-grid">
        <div class="kpi-panel">
          <div class="kpi-badges">
            <div class="pill eff"><label>Efficiency</label><div class="score">${eff.toFixed(1)}</div><div class="bar-wrap"><div class="bar" style="width:${(eff/5)*100}%;"></div></div></div>
            <div class="pill people"><label>People</label><div class="score">${people.toFixed(1)}</div><div class="bar-wrap"><div class="bar" style="width:${(people/5)*100}%;"></div></div></div>
            <div class="pill ops"><label>Profitability – Ops</label><div class="score">${ops.toFixed(1)}</div><div class="bar-wrap"><div class="bar" style="width:${(ops/5)*100}%;"></div></div></div>
            <div class="pill fin"><label>Profitability – Fin</label><div class="score">${fin.toFixed(1)}</div><div class="bar-wrap"><div class="bar" style="width:${(fin/5)*100}%;"></div></div></div>
          </div>

          <div class="kpi-summary" style="margin-top:12px">
            <div class="row"><div class="kpi-tag">Top KPI</div><div class="kpi-text">${escapeHtml(top)}</div></div>
            <div class="row"><div class="kpi-tag">Underperforming</div><div class="kpi-text">${escapeHtml(under)}</div></div>
            <div class="row"><div class="kpi-tag">Remedial</div><div class="kpi-text">${escapeHtml(remedial)}</div></div>
          </div>
        </div>

        <div class="kpi-score-wrap">
          <div class="kpi-score-number">${kpi.toFixed(1)} / 5</div>
          <div class="kpi-therm"><div class="fill" style="width:${fillPct}%"></div></div>
        </div>
      </div>
    </div>
    `;
  }

  btnGenerate.addEventListener("click", () => {
    const company = form.company.value.trim();
    const month = form.month.value.trim();
    if (!company || !month) return alert("Please choose company and month.");

    const eff = parseFloat(form.eff.value) || 0;
    const people = parseFloat(form.people.value) || 0;
    const ops = parseFloat(form.ops.value) || 0;
    const fin = parseFloat(form.fin.value) || 0;

    const data = {
      company, month, eff, people, ops, fin,
      top: form.top.value, under: form.under.value, remedial: form.remedial.value
    };

    preview.innerHTML = buildDashboardHTML(data);
    btnSaveHome.disabled = false;
    btnDelete.disabled = false;

    sessionStorage.setItem("draft-dashboard", JSON.stringify({
      key: key(company, month),
      company, month,
      html: preview.innerHTML,
      kpi: (eff + people + ops)/3
    }));
  });

  btnSaveHome.addEventListener("click", () => {
    const draft = JSON.parse(sessionStorage.getItem("draft-dashboard") || "null");
    if (!draft) return alert("Generate a report first.");

    localStorage.setItem(draft.key, draft.html);
    setLatest(draft.company, draft.kpi, draft.month);
    alert("Report saved and added to homepage.");
  });

  btnDelete.addEventListener("click", () => {
    const company = form.company.value.trim();
    const month = form.month.value.trim();
    if (!company || !month) return alert("Choose company and month to delete.");

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
    } else alert("No saved report found for that company/month.");
  });
});
