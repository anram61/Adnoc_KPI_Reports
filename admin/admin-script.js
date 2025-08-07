document.getElementById("report-form").addEventListener("submit", function(e) {
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

  const avg = ((eff + ppl + ops + fin) / 4).toFixed(2);
  const trendPoints = trend.split(',').map(val => parseFloat(val.trim()));

  let chartData = trendPoints.map((val, i) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    return `{ x: "${monthNames[i]}", y: ${val} }`;
  }).join(",\n");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${company} - ${month} Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body { font-family: Arial; background: #f4f4f4; padding: 30px; }
      .report { background: white; padding: 30px; border-radius: 8px; max-width: 900px; margin: auto; }
      h1, h2 { text-align: center; }
      .pillars { display: flex; justify-content: space-around; margin: 20px 0; }
      .pillar { text-align: center; }
      canvas { width: 100%; max-width: 700px; margin: 20px auto; display: block; }
      .kpis { display: flex; gap: 20px; margin-top: 30px; }
      .kpis > div { flex: 1; background: #f9f9f9; padding: 15px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="report">
      <h1>${company}</h1>
      <h2>${month} 2025 Performance Dashboard</h2>
      <p style="text-align:center;"><strong>KPI Score:</strong> ${avg} / 5</p>

      <div class="pillars">
        <div class="pillar">Efficiency<br><strong>${eff}</strong></div>
        <div class="pillar">People<br><strong>${ppl}</strong></div>
        <div class="pillar">Profitability Ops<br><strong>${ops}</strong></div>
        <div class="pillar">Profitability Fin.<br><strong>${fin}</strong></div>
      </div>

      <canvas id="kpiChart" height="120"></canvas>

      <div class="kpis">
        <div><h3>Top KPIs</h3><p>${topKPIs.replace(/\n/g, "<br>")}</p></div>
        <div><h3>Underperforming</h3><p>${underKPIs.replace(/\n/g, "<br>")}</p></div>
        <div><h3>Remedial Action</h3><p>${remedial.replace(/\n/g, "<br>")}</p></div>
      </div>
    </div>

    <script>
      const ctx = document.getElementById('kpiChart');
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'KPI Score',
            data: [${chartData}],
            borderColor: '#0077cc',
            fill: false,
            tension: 0.4
          }]
        },
        options: {
          scales: {
            x: {
              type: 'category',
              labels: [${trendPoints.map((_, i) => `"${["January","February","March","April","May","June","July","August","September","October","November","December"][i]}"`).join(',')}]
            },
            y: {
              beginAtZero: true,
              max: 5
            }
          }
        }
      });
    </script>
  </body>
  </html>`;
  
  const win = window.open();
  win.document.write(html);
  win.document.close();
});
