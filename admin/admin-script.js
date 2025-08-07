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
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${company} – ${month} Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f0f4f9;
        margin: 0;
        padding: 40px;
      }

      .dashboard {
        background: white;
        max-width: 1100px;
        margin: auto;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(0,0,0,0.05);
        padding: 40px;
      }

      .header-bar {
        background: #004b91;
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 30px;
      }

      .header-bar h1 {
        margin: 0;
        font-size: 28px;
      }

      .subheading {
        text-align: center;
        font-size: 20px;
        margin-bottom: 20px;
        color: #003366;
      }

      .pillars {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 30px;
      }

      .pillar {
        flex: 1;
        padding: 15px;
        border-left: 6px solid #0077cc;
        background: #f5faff;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 0 6px rgba(0,0,0,0.05);
      }

      .pillar h3 {
        margin-bottom: 10px;
        color: #004b91;
        font-size: 16px;
      }

      .stars {
        font-size: 20px;
        color: #ffaa00;
      }

      .score-box {
        background: #dff0d8;
        color: #2e7d32;
        text-align: center;
        padding: 10px;
        font-weight: bold;
        font-size: 18px;
        border-radius: 6px;
        margin: 20px 0 30px;
        border-left: 8px solid #28a745;
      }

      canvas {
        max-width: 100%;
        margin: 30px auto 10px;
        display: block;
        background: #fff;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 0 6px rgba(0,0,0,0.05);
      }

      .boxes {
        display: flex;
        gap: 20px;
        margin-top: 30px;
      }

      .box {
        flex: 1;
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        border-left: 6px solid #0077cc;
        box-shadow: 0 0 6px rgba(0,0,0,0.03);
      }

      .box h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #004b91;
      }

      .footer-note {
        text-align: center;
        color: #666;
        font-size: 13px;
        margin-top: 40px;
      }
    </style>
  </head>
  <body>
    <div class="dashboard">
      <div class="header-bar">
        <h1>${company}</h1>
        <div>${month} 2025 – Digital Performance Dashboard</div>
      </div>

      <div class="subheading">Overall KPI Rating: ${avg} / 5</div>

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

      <div class="score-box">
        📈 YTD Score: ${avg} / 5 – Strong performance
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

      <div class="footer-note">© 2025 ADNOC Dashboard – Automated KPI Generator</div>
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
            backgroundColor: "#e0f0ff",
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#004b91",
            borderWidth: 3
          }]
        },
        options: {
          scales: {
            x: {
              type: 'category',
              title: { display: true, text: 'Month' }
            },
            y: {
              beginAtZero: true,
              max: 5,
              title: { display: true, text: 'Rating' },
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
