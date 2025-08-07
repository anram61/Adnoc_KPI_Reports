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
  const starRating = rating => "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  const trendPoints = trend.split(',').map((val, i) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `{ x: "${months[i]}", y: ${parseFloat(val)} }`;
  }).join(",");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${company} - ${month} Dashboard</title>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body { font-family: Arial, sans-serif; background: #f0f2f5; padding: 40px; }
      .dashboard { max-width: 1100px; margin: auto; background: white; border-radius: 8px; padding: 30px; }
      h1 { font-size: 24px; color: #003366; margin-bottom: 10px; }
      h2 { font-size: 20px; margin: 10px 0; color: #004b91; }
      .summary-bar { text-align: center; margin: 20px 0; font-size: 20px; color: #444; }
      .rating-line { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #e6ecf2; border-radius: 4px; margin: 10px 0; font-size: 14px; }
      .pillars { display: flex; justify-content: space-between; margin: 20px 0; }
      .pillar { flex: 1; margin: 0 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; text-align: center; border: 1px solid #ddd; }
      .pillar h3 { margin-bottom: 5px; color: #003366; }
      .stars { color: #ffaa00; font-size: 20px; }
      .kpi-boxes { display: flex; justify-content: space-between; margin-top: 30px; gap: 15px; }
      .box { flex: 1; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px; }
      canvas { margin: 30px auto 10px; max-width: 100%; height: 280px; display: block; }
    </style>
  </head>
  <body>
    <div class="dashboard">
      <h1>${company}</h1>
      <h2>Group Digital 2025 - ${month} (Mid-Year)</h2>

      <div class="summary-bar">AGT YTD: <strong>${avg} / 5</strong> – Solid Performance</div>

      <div class="pillars">
        <div class="pillar">
          <h3>Efficiency</h3>
          <div class="stars">${starRating(eff)}</div>
        </div>
        <div class="pillar">
          <h3>People</h3>
          <div class="stars">${starRating(ppl)}</div>
        </div>
        <div class="pillar">
          <h3>Profitability – Ops</h3>
          <div class="stars">${starRating(ops)}</div>
        </div>
        <div class="pillar">
          <h3>Profitability – Financials</h3>
          <div class="stars">${starRating(fin)}</div>
        </div>
      </div>

      <canvas id="kpiChart"></canvas>

      <div class="kpi-boxes">
        <div class="box">
          <h3>Top KPIs</h3>
          <p>${topKPIs.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="box">
          <h3>Underperforming KPIs</h3>
          <p>${underKPIs.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="box">
          <h3>Remedial Actions</h3>
          <p>${remedial.replace(/\n/g, "<br>")}</p>
        </div>
      </div>
    </div>

    <script>
      const ctx = document.getElementById("kpiChart");
      new Chart(ctx, {
        type: "line",
        data: {
          datasets: [{
            label: "KPI Rating",
            data: [${trendPoints}],
            borderColor: "#0077cc",
            backgroundColor: "#e6f0fc",
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { type: 'category', title: { display: true, text: 'Month' } },
            y: {
              min: 0,
              max: 5,
              title: { display: true, text: 'KPI Score' },
              ticks: { stepSize: 0.5 }
            }
          },
          plugins: {
            legend: { display: false }
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
