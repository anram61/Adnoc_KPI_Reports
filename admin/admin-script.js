document.getElementById("report-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const company = document.getElementById("company").value;
    const month = document.getElementById("month").value;
    const eff = parseFloat(document.getElementById("efficiency").value);
    const ppl = parseFloat(document.getElementById("people").value);
    const ops = parseFloat(document.getElementById("operations").value);
    const fin = parseFloat(document.getElementById("financials").value);
    const topKPIs = document.getElementById("top-kpis").value;
    const underKPIs = document.getElementById("under-kpis").value;
    const remedial = document.getElementById("remedial").value;
    const trend = document.getElementById("kpi-trend").value;

    const avg = ((eff + ppl + ops + fin) / 4).toFixed(1);

    const defaultScores = {
        "Adnoc Onshore": 3.5,
        "Adnoc Offshore": 4.0,
        "Adnoc Al Dhafra & Al Yasat": 3.8,
        "Adnoc Drilling": 3.6,
        "Adnoc Sour Gas": 4.1,
        "Adnoc Refining": 3.9,
        "Adnoc Distribution": 3.7,
        "Adnoc Borouge": 3.8,
        "Adnoc L & S": 4.0,
        "Adnoc Global Trading": 4.2,
        "Adnoc LNG": 3.9,
        "Adnoc Gas": 4.1
    };
    defaultScores[company] = parseFloat(avg);

    const trendPoints = trend.split(',').map((val, i) => {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return `{ x: "${months[i]}", y: ${parseFloat(val)} }`;
    }).join(",");

    const companyListHTML = Object.keys(defaultScores)
        .map(name => `<tr><td>${name}</td><td>${defaultScores[name]}</td></tr>`)
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>${company} – ${month} Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
        .container { display: flex; }
        .sidebar { width: 300px; background: #004b91; color: white; padding: 20px; }
        .sidebar h2 { font-size: 18px; margin-bottom: 15px; }
        .sidebar table { width: 100%; color: white; border-collapse: collapse; }
        .sidebar td { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
        .main { flex: 1; padding: 30px; background: white; }
        .kpi-bar { height: 30px; background: #ddd; border-radius: 15px; overflow: hidden; margin-bottom: 20px; }
        .kpi-bar-fill { height: 100%; background: linear-gradient(to right, green, yellow, red); width: ${(avg/5)*100}%;}
        .pillars { display: flex; gap: 15px; margin-bottom: 20px; }
        .pillar { flex: 1; background: #eef3f7; padding: 15px; border-radius: 8px; border-left: 6px solid #0077cc; }
        .boxes { display: flex; gap: 15px; margin-top: 20px; }
        .box { flex: 1; background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 6px solid #004b91; }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="sidebar">
            <h2>Company KPI Scores</h2>
            <table>${companyListHTML}</table>
        </div>
        <div class="main">
            <h1>${company} — ${month} 2025</h1>
            <h3>Overall KPI: ${avg} / 5</h3>
            <div class="kpi-bar"><div class="kpi-bar-fill"></div></div>

            <div class="pillars">
                <div class="pillar">Efficiency: ${eff}</div>
                <div class="pillar">People: ${ppl}</div>
                <div class="pillar">Profitability - Ops: ${ops}</div>
                <div class="pillar">Profitability - Financials: ${fin}</div>
            </div>

            <canvas id="kpiChart"></canvas>

            <div class="boxes">
                <div class="box"><h4>Top KPIs</h4><p>${topKPIs}</p></div>
                <div class="box"><h4>Underperforming KPIs</h4><p>${underKPIs}</p></div>
                <div class="box"><h4>Remedial Actions</h4><p>${remedial}</p></div>
            </div>
        </div>
    </div>

    <script>
        const ctx = document.getElementById("kpiChart");
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: "KPI Trend",
                    data: [${trendPoints}],
                    borderColor: "#004b91",
                    backgroundColor: "rgba(0,75,145,0.2)",
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, max: 5 } }
            }
        });
    </script>
    </body>
    </html>`;

    const win = window.open();
    win.document.write(html);
    win.document.close();
});
