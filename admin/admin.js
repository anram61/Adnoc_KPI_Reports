// admin.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reportForm");
    const previewContainer = document.getElementById("reportPreview");
    const saveHomeBtn = document.getElementById("saveHome");

    // Generate Live Preview
    form.addEventListener("input", generatePreview);

    function generatePreview() {
        const company = document.getElementById("company").value;
        const month = document.getElementById("month").value;
        const efficiency = document.getElementById("efficiency").value;
        const people = document.getElementById("people").value;
        const profitabilityOps = document.getElementById("profitOps").value;
        const profitabilityFin = document.getElementById("profitFin").value;
        const topKpis = document.getElementById("topKpis").value;
        const underKpis = document.getElementById("underKpis").value;
        const actions = document.getElementById("actions").value;

        // Check if we have minimum data for preview
        if (!company || !month) {
            previewContainer.innerHTML = `<p class="empty-preview">Fill in the details above to preview the report.</p>`;
            saveHomeBtn.disabled = true;
            return;
        }

        // Generate clean, spaced out report layout
        previewContainer.innerHTML = `
            <div class="report-card">
                <h2>${company} - ${month} KPI Dashboard</h2>
                <div class="pillars">
                    <div class="pillar"><strong>Efficiency:</strong> ${efficiency || "-"}</div>
                    <div class="pillar"><strong>People:</strong> ${people || "-"}</div>
                    <div class="pillar"><strong>Profitability - Operations:</strong> ${profitabilityOps || "-"}</div>
                    <div class="pillar"><strong>Profitability - Financials:</strong> ${profitabilityFin || "-"}</div>
                </div>
                <div class="kpi-section">
                    <h3>Top KPIs</h3>
                    <p>${topKpis || "No data"}</p>
                </div>
                <div class="kpi-section">
                    <h3>Underperforming KPIs</h3>
                    <p>${underKpis || "No data"}</p>
                </div>
                <div class="kpi-section">
                    <h3>Remedial Actions</h3>
                    <p>${actions || "No data"}</p>
                </div>
                <div class="chart-placeholder">
                    <canvas id="kpiChart"></canvas>
                </div>
            </div>
        `;

        // Enable save button
        saveHomeBtn.disabled = false;

        // Render chart
        renderChart(efficiency, people, profitabilityOps, profitabilityFin);
    }

    // Save to Homepage
    saveHomeBtn.addEventListener("click", () => {
        const company = document.getElementById("company").value;
        const month = document.getElementById("month").value;

        if (!company || !month) {
            alert("Please fill in at least company and month before saving.");
            return;
        }

        const reportHTML = previewContainer.innerHTML;
        const storedReports = JSON.parse(localStorage.getItem("kpiReports") || "{}");

        if (!storedReports[company]) storedReports[company] = {};
        storedReports[company][month] = reportHTML;

        localStorage.setItem("kpiReports", JSON.stringify(storedReports));

        alert("Report saved to homepage successfully!");
    });

    function renderChart(efficiency, people, profitabilityOps, profitabilityFin) {
        const ctx = document.getElementById("kpiChart");
        if (!ctx) return;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Efficiency", "People", "Profit Ops", "Profit Fin"],
                datasets: [{
                    label: "KPI Ratings",
                    data: [
                        Number(efficiency) || 0,
                        Number(people) || 0,
                        Number(profitabilityOps) || 0,
                        Number(profitabilityFin) || 0
                    ],
                    fill: false,
                    borderColor: "#0077b6",
                    tension: 0.3,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: "#0077b6"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, max: 10 }
                }
            }
        });
    }
});
