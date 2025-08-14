// ===== Helper Functions =====
function getStorageKey(company, month) {
    return `${company}_${month}_report`;
}

function saveReport(company, month, html) {
    localStorage.setItem(getStorageKey(company, month), html);
}

// ===== Form Handling =====
document.getElementById("reportForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const company = document.getElementById("company").value;
    const month = document.getElementById("month").value;

    const efficiency = document.getElementById("efficiency").value;
    const people = document.getElementById("people").value;
    const profitabilityOps = document.getElementById("profitabilityOps").value;
    const profitabilityFin = document.getElementById("profitabilityFin").value;

    const topKPIs = document.getElementById("topKPIs").value;
    const underKPIs = document.getElementById("underKPIs").value;
    const remedialActions = document.getElementById("remedialActions").value;

    // ===== Generated Report HTML =====
    const reportHTML = `
        <div class="dashboard-report">
            <h2>${company} - ${month} KPI Dashboard</h2>
            <div class="pillar">Efficiency: ${efficiency}</div>
            <div class="pillar">People: ${people}</div>
            <div class="pillar">Profitability - Operations: ${profitabilityOps}</div>
            <div class="pillar">Profitability - Financials: ${profitabilityFin}</div>
            <div class="section"><strong>Top KPIs:</strong><br>${topKPIs}</div>
            <div class="section"><strong>Underperforming KPIs:</strong><br>${underKPIs}</div>
            <div class="section"><strong>Remedial Actions:</strong><br>${remedialActions}</div>
        </div>
    `;

    saveReport(company, month, reportHTML);

    alert(`Report for ${company} (${month}) saved successfully.`);
    this.reset();
});
