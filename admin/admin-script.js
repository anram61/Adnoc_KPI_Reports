// admin-script.js
document.getElementById("report-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // gather inputs
  const company = document.getElementById("company").value || "Company";
  const month = document.getElementById("month").value || "Month";
  const eff = parseFloat(document.getElementById("efficiency").value) || 0;
  const ppl = parseFloat(document.getElementById("people").value) || 0;
  const ops = parseFloat(document.getElementById("operations").value) || 0;
  const fin = parseFloat(document.getElementById("financials").value) || 0;
  const topKPIs = document.getElementById("top-kpis").value || "";
  const underKPIs = document.getElementById("under-kpis").value || "";
  const remedial = document.getElementById("remedial").value || "";
  const trendRaw = document.getElementById("kpi-trend").value || "";

  // compute average KPI rating
  const avg = ((eff + ppl + ops + fin) / 4);
  const avgDisplay = isNaN(avg) ? "0.0" : avg.toFixed(2);

  // parse trend values into array of 12 numbers (fill missing with null)
  let trendValues = trendRaw.split(",")
    .map(s => {
      const n = parseFloat(s.trim());
      return isNaN(n) ? null : n;
    })
    .slice(0, 12);
  while (trendValues.length < 12) trendValues.push(null);

  // prepare month labels (short)
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // helper to escape HTML (basic)
  const esc = (str) => String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // build HTML with inline CSS to ensure styles are applied in the new tab
  const html = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${esc(company)} — ${esc(month)} KPI Dashboard</title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      /* Page background + container */
      :root{
        --brand-dark:#003866;
        --brand:#004b91;
        --accent:#0077cc;
        --muted:#f1f6fb;
        --panel:#ffffff;
        --green:#28a745;
        --orange:#ff9800;
        --red:#dc3545;
      }
      html,body{height:100%;margin:0;font-family: "Segoe UI", Roboto, Arial, sans-serif;background: linear-gradient(135deg,#eaf6ff 0%, #f7fbff 50%, #ffffff 100%);color:var(--brand-dark);}
      .wrap{max-width:1200px;margin:28px auto;padding:28px;}
      .card{background:var(--panel);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.06);overflow:hidden;}

      /* Header */
      .header{
        background: linear-gradient(90deg,var(--brand), #0077cc);
        color:#fff;padding:22px 28px;
      }
      .header .title{font-size:26px; margin:0; font-weight:700;}
      .header .subtitle{font-size:14px;opacity:0.95;margin-top:6px;}

      /* layout - top area */
      .top-grid{display:flex;gap:20px;padding:22px 28px;align-items:flex-start;}
      .left-column{flex:0 0 260px;}
      .main-column{flex:1;}

      /* left: company comparison */
      .comp-card{background:linear-gradient(180deg,#ffffff,#f7fbff);border-left:6px solid var(--accent);padding:14px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.03);}
      .comp-card h4{margin:0 0 10px;color:var(--brand-dark);font-size:14px;}
      .company-list{margin:0;padding:0;list-style:none;}
      .company-list li{display:flex;justify-content:space-between;padding:8px 6px;border-radius:6px;margin-bottom:6px;background:#fff;align-items:center;box-shadow:0 1px 0 rgba(0,0,0,0.03);}
      .company-list li strong{color:var(--brand-dark);font-weight:700;}
      .company-list li span{color:#666;}

      /* main column top - KPI score & bar */
      .score-row{display:flex;align-items:center;gap:18px;margin-bottom:16px;}
      .score-bubble{background:linear-gradient(180deg,#fff,#f0fbff);border-radius:14px;padding:14px 18px;border-left:6px solid var(--green);min-width:170px;text-align:center;box-shadow:0 6px 18px rgba(0,123,204,0.06);}
      .score-bubble .num{font-size:28px;font-weight:800;color:var(--brand-dark);}
      .score-bubble .label{font-size:13px;color:#666;margin-top:6px}

      .kpi-scale{flex:1;padding:6px;}
      .scale-track{position:relative;height:36px;border-radius:18px;background:linear-gradient(90deg,#d8eefc 0%, #eef6ff 100%);border:1px solid #d6eaf8;display:flex;overflow:hidden;}
      .scale-seg{flex:1;height:100%;}
      .seg0{background:linear-gradient(180deg,#f8d7da,#fbeaea);} /* low */
      .seg1{background:linear-gradient(180deg,#fde2b8,#fff2dd);}
      .seg2{background:linear-gradient(180deg,#fff9d9,#fffdf2);}
      .seg3{background:linear-gradient(180deg,#e6f7e7,#f5fff5);}
      .seg4{background:linear-gradient(180deg,#dff3ff,#eef9ff);} /* high */
      .scale-ticks{display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:#555}
      .indicator {
        position:absolute;
        top:-8px;
        width:14px;height:14px;border-radius:50%;
        background:#004b91;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.15);
        transform:translateX(-50%);
      }

      /* Pillars - big colorful boxes */
      .pillars{display:flex;gap:14px;margin-top:18px}
      .pillar{flex:1;padding:14px;border-radius:10px;background:linear-gradient(180deg,#ffffff,#fbfdff);border-left:6px solid var(--accent);box-shadow:0 6px 18px rgba(0,0,0,0.03);text-align:center}
      .pillar h3{margin:0;font-size:13px;color:var(--brand-dark)}
      .pillar .value{font-size:20px;font-weight:800;margin-top:8px;color:#222}

      /* chart area */
      .chart-card{margin-top:22px;padding:16px;border-radius:12px;background:linear-gradient(180deg,#ffffff,#fbfdff);box-shadow:0 6px 18px rgba(0,0,0,0.03)}
      canvas{width:100% !important; height:380px !important;}

      /* KPI boxes at bottom */
      .kbd-row{display:flex;gap:16px;margin-top:22px}
      .kbd{flex:1;padding:16px;border-radius:10px;background:linear-gradient(180deg,#ffffff,#fbfdff);border-left:6px solid #004b91;box-shadow:0 6px 20px rgba(0,0,0,0.04)}
      .kbd h4{margin:0 0 8px;color:var(--brand-dark)}
      .kbd p{margin:0;color:#333;line-height:1.45}

      /* footer */
      .footer{font-size:12px;color:#777;text-align:center;padding:14px 0;margin-top:20px}

      /* small responsive */
      @media (max-width:900px){
        .top-grid{flex-direction:column}
        .left-column{flex:unset}
        canvas{height:240px !important}
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="header">
          <div class="title">${esc(company)}</div>
          <div class="subtitle">${esc(month)} 2025 — Performance Dashboard</div>
        </div>

        <div class="top-grid">
          <div class="left-column" style="padding:18px;">
            <div class="comp-card">
              <h4>Company Scores (sample)</h4>
              <ul class="company-list">
                <li><strong>ADNOC Offshore</strong><span>3.91</span></li>
                <li><strong>ADNOC Onshore</strong><span>3.19</span></li>
                <li><strong>ADNOC Drilling</strong><span>3.88</span></li>
                <li><strong>ADNOC Global Trading</strong><span>3.23</span></li>
                <li><strong>ADNOC Refining</strong><span>4.44</span></li>
              </ul>
            </div>
          </div>

          <div class="main-column" style="padding:18px;">
            <div class="score-row">
              <div class="score-bubble">
                <div class="num">${esc(avgDisplay)}</div>
                <div class="label">YTD Score</div>
              </div>

              <div class="kpi-scale">
                <div class="kpi-bar-container">
                  <div class="kpi-bar-label" style="font-weight:700;margin-bottom:8px;color:#04476b">Performance Scale (0 - 5)</div>
                  <div class="scale-track" id="scaleTrack">
                    <div class="scale-seg seg0"></div>
                    <div class="scale-seg seg1"></div>
                    <div class="scale-seg seg2"></div>
                    <div class="scale-seg seg3"></div>
                    <div class="scale-seg seg4"></div>
                    <div class="indicator" id="indicator"></div>
                  </div>
                  <div class="scale-ticks">
                    <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pillars">
              <div class="pillar"><h3>Efficiency</h3><div class="value">${esc(eff.toFixed(2))} / 5</div></div>
              <div class="pillar"><h3>People</h3><div class="value">${esc(ppl.toFixed(2))} / 5</div></div>
              <div class="pillar"><h3>Profitability - Operations</h3><div class="value">${esc(ops.toFixed(2))} / 5</div></div>
              <div class="pillar"><h3>Profitability - Financials</h3><div class="value">${esc(fin.toFixed(2))} / 5</div></div>
            </div>

            <div class="chart-card">
              <canvas id="kpiChart"></canvas>
            </div>

            <div class="kbd-row">
              <div class="kbd">
                <h4>Top KPIs</h4>
                <p>${topKPIs.replace(/\\n/g, "<br>")}</p>
              </div>
              <div class="kbd">
                <h4>Underperforming KPIs</h4>
                <p>${underKPIs.replace(/\\n/g, "<br>")}</p>
              </div>
              <div class="kbd">
                <h4>Remedial Action</h4>
                <p>${remedial.replace(/\\n/g, "<br>")}</p>
              </div>
            </div>

            <div class="footer">© ADNOC — Automated KPI Dashboard (Generated)</div>
          </div>
        </div>

      </div>
    </div>

    <script>
      // place the indicator on the scale: compute percent of avg (0..5)
      (function placeIndicator(){
        try{
          const avg = ${isNaN(avg) ? 0 : avg};
          const percent = Math.max(0, Math.min(1, avg / 5)) * 100;
          const indicator = document.getElementById('indicator');
          // set left offset relative to parent width
          indicator.style.left = percent + '%';
        }catch(e){console.warn(e)}
      })();

      // Chart.js - big chart
      (function renderChart(){
        const ctx = document.getElementById('kpiChart').getContext('2d');
        const labels = ${JSON.stringify(monthLabels)};
        const data = ${JSON.stringify(trendValues)};
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'KPI Score',
              data: data,
              borderColor: '#004b91',
              backgroundColor: 'rgba(0,123,204,0.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointBackgroundColor: '#0077cc',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { suggestedMin: 0, suggestedMax: 5, ticks: { stepSize: 0.5 } }
            },
            plugins: { legend: { display: false } }
          }
        });
      })();
    </script>
  </body>
  </html>
  `;

  // open new tab with the generated dashboard
  const win = window.open();
  win.document.write(html);
  win.document.close();
});
