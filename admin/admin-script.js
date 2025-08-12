document.getElementById("report-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const company = document.getElementById("company").value;
  const month = document.getElementById("month").value;

  const efficiency = parseFloat(document.getElementById("efficiency").value) || 0;
  const people = parseFloat(document.getElementById("people").value) || 0;
  const profitabilityOps = parseFloat(document.getElementById("profitability-ops").value) || 0;
  const profitabilityFin = parseFloat(document.getElementById("profitability-fin").value) || 0;

  const kpiScore = ((efficiency + people + profitabilityOps) / 3).toFixed(1);

  const topKPI = document.getElementById("top-kpi").value;
  const underKPI = document.getElementById("under-kpi").value;
  const remedial = document.getElementById("remedial").value;

  let companyKPIs = JSON.parse(localStorage.getItem("companyKPIs") || "{}");
  companyKPIs[company] = kpiScore;
  localStorage.setItem("companyKPIs", JSON.stringify(companyKPIs));

  updateCompanyKPIList();

  const reportHTML = `
    <div style="font-family: Arial; background: #f7f9fc; padding: 20px; border-radius: 8px;">
      <h2 style="color:#004b91;">${company} - ${month} 2025</h2>
      <div style="margin: 20px 0;">
        <strong>KPI Score:</strong> ${kpiScore}
        <div style="width: 100%; height: 20px; border-radius: 10px; overflow: hidden; background: #ddd;">
          <div style="width: ${kpiScore}%; height: 100%; background: ${getKPIColor(kpiScore)};"></div>
        </div>
      </div>
      <h3 style="color:#004b91;">Pillar Ratings</h3>
      <ul>
        <li>Efficiency: ${efficiency}</li>
        <li>People: ${people}</li>
        <li>Profitability – Operations: ${profitabilityOps}</li>
        <li>Profitability – Financials: ${profitabilityFin}</li>
      </ul>
      <h3 style="color:#004b91;">Top KPIs</h3>
      <p>${topKPI}</p>
      <h3 style="color:#004b91;">Underperforming KPIs</h3>
      <p>${underKPI}</p>
      <h3 style="color:#004b91;">Remedial Actions</h3>
      <p>${remedial}</p>
    </div>
  `;

  let reports = JSON.parse(localStorage.getItem("reports") || "{}");
  if (!reports[company]) reports[company] = {};
  reports[company][month] = reportHTML;
  localStorage.setItem("reports", JSON.stringify(reports));

  alert("Report generated and saved!");
  document.getElementById("report-form").reset();
});

function getKPIColor(score) {
  if (score >= 80) return "linear-gradient(90deg, #00c851, #007e33)";
  if (score >= 60) return "linear-gradient(90deg, #ffbb33, #ff8800)";
  return "linear-gradient(90deg, #ff4444, #cc0000)";
}

function updateCompanyKPIList() {
  const container = document.getElementById("all-company-kpis");
  if (!container) return;
  let companyKPIs = JSON.parse(localStorage.getItem("companyKPIs") || "{}");
  container.innerHTML = "";
  for (let [company, score] of Object.entries(companyKPIs)) {
    container.innerHTML += `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ccc;">
        <span>${company}</span>
        <span><strong>${score}</strong></span>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", updateCompanyKPIList);
