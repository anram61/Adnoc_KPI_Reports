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
  const trendPoints = trend.split(',').map((val, i) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `{ x: "${months[i]}", y: ${parseFloat(val)} }`;
  }).join(",");

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${company} – ${month} Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        margin: 0;
        font-family: 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #e0f7ff, #f2f2f2);
        padding: 40px;
        color: #003366;
      }

      .dashboard {
        background: #fff;
        max-width: 1100px;
        margin: auto;
        border-radius: 14px;
        box-shadow: 0 0 30px rgba(0,0,0,0.08);
        padding: 40px;
      }

      .header {
        background: #004b91;
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 30px;
      }

      .header h1 {
        font-size: 28px;
        margin: 0 0 10px;
      }

      .header h2 {
        font-size: 18px;
        font-weight: normal;
        margin: 0;
      }

      .kpi-bar {
        margin: 30px auto;
        text-align: center;
      }

      .kpi-bar .label {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .kpi-bar .bar-container {
        width: 90%;
        height: 30px;
        background: #eee;
        border-radius: 20px;
        overflow: hidden;
        margin: auto;
        border: 2px solid #ccc;
      }

      .kpi-bar .bar {
        height: 100%;
        background: linear-gradient(to right, #28a745, #ffc107, #dc3545);
        width: ${(avg / 5) * 100}%;
        transition: width 0.4s ease-in-out;
      }

      .pillars {
        display: flex;
        gap: 20px;
        justify-content: space-between;
        margin-top: 30px;
      }

      .pillar {
        flex: 1;
        padding: 15px 20px;
        border-radius: 10px;
        background: #f0f8ff;
        box-shadow: 0 0 6px rgba(0,0,0,0.05);
        border-left: 6px solid #0077cc;
      }

      .pillar h3 {
        margin: 0 0 10px;
        color: #004b91;
      }

      .pillar .score {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }

      canvas {
        max-width: 100%;
        margin: 40px auto;
        display: block;
        background: white;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 0 6px rgba(0,0,0,0.05);
      }

      .boxes {
        display: flex;
        gap: 20px;
        margin-top: 30px;
      }

      .box {
        flex: 1;
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        border-left: 6px solid #004b91;
        box-shadow: 0 0 8px rgba(0,0,0,0.05);
      }

      .box h3 {
        margin-top: 0;
        color: #003366;
      }

      .footer {
        text-align: center;
        font-size: 13px;
        color: #777;
        margin-top: 50px;
      }
    </style>
  </head>
  <body>
    <div class="dashboard">
      <div class="header">
        <h1>${company}</h1>
        <h2>${month} 2025 — Performance Dashboard</h2>
      </div>

      <div class="kpi-bar">
        <div class="label">Overall KPI Rating: ${avg} / 5</div>
        <div class="bar-container">
          <div class="bar"></div>
        </div>
      </div>

      <div class="pillars">
        <div class="pillar">
          <h3>Efficiency</h3>
          <div class="score">${eff} / 5</div>
        </div>
        <div class="pillar">
          <h3>People</h3>
          <div class="score">${ppl} / 5</div>
        </div>
        <div class="pillar">
          <h3>Profitability - Ops</h3>
          <div class="score">${ops} / 5</div>
        </div>
        <div class="pillar">
          <h3>Profitability - Financials</h3>
          <div class="score">${fin} / 5</div>
        </div>
      </div>

      <canvas id="kpiChart" height="120"></canvas>

      <div class="boxes">
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

      <div class="footer">© 2025 ADNOC — Generated Dashboard</div>
    </div>

    <script>
      const ctx = document.getElementById("kpiChart");
      new Chart(ctx, {
        type: "line",
        data: {
          datasets: [{
            label: "KPI Trend",
            data: [${trendPoints}],
            borderColor: "#004b91",
            backgroundColor: "rgba(0, 123, 255, 0.2)",
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "#004b91",
            fill: true
          }]
        },
        options: {
          scales: {
            x: {
              type: "category",
              title: { display: true, text: "Month" }
            },
            y: {
              beginAtZero: true,
              max: 5,
              title: { display: true, text: "Rating" }
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
