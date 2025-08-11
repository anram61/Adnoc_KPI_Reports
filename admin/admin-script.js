document.getElementById('reportForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // read inputs
  const company = document.getElementById('company').value || 'ADNOC';
  const month = document.getElementById('month').value || 'June';
  const eff = parseFloat(document.getElementById('efficiency').value) || 0;
  const ppl = parseFloat(document.getElementById('people').value) || 0;
  const ops = parseFloat(document.getElementById('operations').value) || 0;
  const fin = parseFloat(document.getElementById('financials').value) || 0;
  const topKpi = document.getElementById('topKpi').value || '';
  const underKpi = document.getElementById('underKpi').value || '';
  const remedial = document.getElementById('remedial').value || '';
  const trendRaw = document.getElementById('kpi-trend').value || '';

  // compute avg
  const avg = ((eff + ppl + ops + fin) / 4);
  const avgDisplay = isNaN(avg) ? 0 : Math.round(avg * 100) / 100;

  // normalize trend into 12 values (null if missing)
  const trendParts = trendRaw.split(',').map(x => {
    const n = parseFloat(x);
    return Number.isFinite(n) ? n : null;
  });
  while (trendParts.length < 12) trendParts.push(null);
  const monthsShort = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // default leaderboard scores (you can edit these)
  const leaderboardDefault = {
    "AGT": 3.00,
    "ADNOC Onshore": 3.19,
    "ADNOC Offshore": 3.91,
    "Distribution": 3.20,
    "ADNOC Gas": 3.75,
    "ADNOC Sour Gas": 3.68,
    "Refining": 4.44,
    "Borouge": 3.21,
    "Al Dhafra & Yasat": 3.51,
    "ADNOC L&S": 3.65,
    "ADNOC Drilling": 3.88,
    "ADNOC LNG": 3.90
  };

  // set selected company score (normalize key names)
  function normalizeName(n){
    return String(n).trim();
  }
  const selKey = normalizeName(company);
  // create leaderboard object (clone)
  const leaderboard = Object.assign({}, leaderboardDefault);
  // if selected company matches casing or variant, set it
  // allow mapping like "Adnoc Offshore" -> "ADNOC Offshore" if needed
  for (const k of Object.keys(leaderboard)) {
    if (k.toLowerCase().includes(selKey.toLowerCase()) || selKey.toLowerCase().includes(k.toLowerCase())) {
      leaderboard[k] = avgDisplay;
      break;
    }
  }

  // build table rows HTML, highlight selected
  const rowsHtml = Object.keys(leaderboard).map(k => {
    const val = leaderboard[k];
    const isSelected = k.toLowerCase().includes(selKey.toLowerCase()) || selKey.toLowerCase().includes(k.toLowerCase());
    return `<div class="row-item${isSelected ? ' selected' : ''}">
      <div class="company-name">${k}</div>
      <div class="company-score">${val.toFixed(2)}</div>
    </div>`;
  }).join('');

  // simple star rendering (rounded)
  function starHtml(n){
    const r = Math.round(n);
    let out = '';
    for (let i=1;i<=5;i++) out += (i<=r) ? '★' : '☆';
    return `<span class="stars">${out}</span>`;
  }

  // escape helper
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // build final html (inline CSS for exact look)
  const html = `<!doctype html>
  <html><head><meta charset="utf-8"><title>${esc(company)} — ${esc(month)} Dashboard</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root{
      --blue:#004b91; --accent:#0077cc; --muted:#f1f6fb; --card:#ffffff; --green:#28a745; --light-gray:#e9eef3;
      --box-shadow: 0 8px 22px rgba(0,0,0,0.06);
    }
    html,body{height:100%;margin:0;font-family:Inter, "Segoe UI", Arial; background:linear-gradient(180deg,#f3f6f9,#ffffff);color:#1b2b3a}
    .page{max-width:1180px;margin:26px auto;padding:18px}
    .header-panel{background:linear-gradient(180deg,#efeff1,#f7f8fa);padding:20px;border-radius:10px;box-shadow:var(--box-shadow)}
    .meta{display:flex;justify-content:space-between;align-items:flex-start}
    .meta-left{max-width:76%}
    .meta-left h3{color: #64788a;margin:0;font-weight:600}
    .meta-left h1{margin:6px 0 8px;color:var(--blue);font-size:28px}
    .meta-right img{height:56px}
    /* KPI bar area */
    .kpi-area{margin-top:8px;display:flex;gap:18px;align-items:center}
    .kpi-bar-wrap{flex:1}
    .kpi-title{font-size:12px;color:#6c7a86;margin-bottom:6px}
    .kpi-score{font-size:24px;color:#0b2a44;font-weight:700;margin-bottom:6px}
    .scale{background:#e7f0fb;border-radius:8px;overflow:hidden;border:1px solid #dbeafc;height:44px;position:relative}
    .segment{height:100%;display:inline-block}
    .seg-a{background:#1e56c8;width:20%}
    .seg-b{background:#1b67d6;width:20%}
    .seg-c{background:#2b79dd;width:20%}
    .seg-d{background:#97b7d9;width:20%}
    .seg-e{background:#cbd7e6;width:20%}
    .scale-labels{display:flex;justify-content:space-between;margin-top:8px;color:#6d7a85;font-size:12px}
    .indicator{position:absolute;top:-8px;width:14px;height:14px;border-radius:50%;background:var(--blue);border:3px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,0.12);transform:translateX(-50%)}
    /* Pillars */
    .pillars{display:flex;gap:12px;margin-top:14px}
    .pillar{flex:1;background:linear-gradient(180deg,#fff,#fbfeff);padding:12px;border-radius:8px;border-left:6px solid var(--accent);text-align:center;box-shadow:0 6px 18px rgba(0,0,0,0.03)}
    .pillar h4{margin:0;color:#004b91;font-size:13px}
    .pillar .value{font-size:18px;font-weight:800;margin-top:8px}
    .pillar .small{font-size:12px;color:#6b7b85;margin-top:4px}

    /* main layout */
    .main-grid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:16px}
    .chart-card{background:var(--card);padding:22px;border-radius:10px;box-shadow:var(--box-shadow)}
    .chart-title{text-align:center;color:#374957;font-weight:700;margin-bottom:6px;font-size:18px}
    .chart-wrap{padding:10px 0}
    canvas{width:100% !important;height:420px !important}

    /* leaderboard and bottom boxes */
    .bottom-grid{display:flex;gap:18px;margin-top:18px}
    .left-box{flex:1}
    .right-box{flex:1}
    .kbd{background:var(--card);padding:14px;border-radius:10px;box-shadow:var(--box-shadow)}
    .kbd h5{margin:0 0 6px;color:#2b4a63}

    .leaderboard{background:var(--card);padding:12px;border-radius:10px;box-shadow:var(--box-shadow);border-left:6px solid var(--blue)}
    .row-item{display:flex;justify-content:space-between;padding:8px 6px;border-radius:6px;margin-bottom:8px;background:#f7fbff;align-items:center}
    .row-item.selected{background:#fff1f1;border-left:4px solid #d43f3f}
    .company-name{font-weight:700}
    .company-score{background:#e9f7ef;padding:6px 8px;border-radius:6px;color:#1d6f3b;font-weight:700}

    .three-boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
    .box{background:var(--card);padding:14px;border-radius:10px;box-shadow:var(--box-shadow);border-left:6px solid #004b91}
    .box h4{margin:0;color:#2b4a63}
    .box p{margin-top:8px;color:#334;line-height:1.5}

    .footer-note{font-size:12px;color:#6b7b85;margin-top:18px}
    @media (max-width:980px){
      .pillars{flex-direction:column}
      canvas{height:280px !important}
    }
  </style>
  </head>
  <body>
    <div class="page">
      <div class="header-panel">
        <div class="meta">
          <div class="meta-left">
            <div style="font-size:12px;color:#7b8894">ADNOC Classification: Internal</div>
            <h3>Group Digital 2025</h3>
            <h1 style="text-transform:uppercase">${esc(company)} YTD</h1>
          </div>
          <div class="meta-right">
            <img src="assets/adnoc-logo.png" alt="logo" style="height:58px"/>
          </div>
        </div>

        <div class="kpi-area">
          <div class="kpi-bar-wrap">
            <div class="kpi-title">Performance scale</div>
            <div class="kpi-score">${avgDisplay.toFixed(2)} / 5 — <span style="color:#64788a">Solid Performance</span></div>
            <div class="scale" id="scale">
              <div class="segment seg-a"></div>
              <div class="segment seg-b"></div>
              <div class="segment seg-c"></div>
              <div class="segment seg-d"></div>
              <div class="segment seg-e"></div>
              <div class="indicator" id="indicator"></div>
            </div>
            <div class="scale-labels">
              <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
            <div class="pillars" style="margin-top:14px">
              <div class="pillar"><h4>Efficiency</h4><div class="value">${eff.toFixed(2)}/5</div><div class="small">▲</div></div>
              <div class="pillar"><h4>People</h4><div class="value">${ppl.toFixed(2)}/5</div><div class="small">▼</div></div>
              <div class="pillar"><h4>Profitability - Operations</h4><div class="value">${ops.toFixed(2)}/5</div><div class="small"></div></div>
              <div class="pillar"><h4>Profitability - Financials</h4><div class="value">${fin.toFixed(2)}/5</div><div class="small"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:18px;margin-top:16px;align-items:flex-start">
        <!-- left: major content -->
        <div style="flex:1">
          <div class="chart-card">
            <div class="chart-title">${company.toUpperCase()}</div>
            <div class="chart-wrap">
              <canvas id="kpiChart"></canvas>
            </div>
          </div>

          <div class="three-boxes" style="margin-top:12px">
            <div class="box"><h4 style="color:#168a2b">Top KPIs</h4><p>${topKpi.replace(/\\n/g,'<br>')||'—'}</p></div>
            <div class="box" style="border-left:6px solid #d43f3f"><h4 style="color:#b02a2a">Under Performing / focus area KPI</h4><p>${underKpi.replace(/\\n/g,'<br>')||'None'}</p></div>
            <div class="box"><h4>Recommendation</h4><p>${remedial.replace(/\\n/g,'<br>')||'—'}</p></div>
          </div>

          <div class="footer-note">For more breakdown details refer to the executive summary link below<br/>All Figures subject to GBDO approval*</div>
        </div>

        <!-- right: leaderboard -->
        <div style="width:320px">
          <div class="leaderboard">
            <h4 style="margin:0 0 8px">Leadership Score Board</h4>
            ${rowsHtml}
          </div>
        </div>
      </div>
    </div>

    <script>
      // position indicator (avg -> percent)
      (function(){
        const avg = ${isNaN(avg) ? 0 : avg};
        const pct = Math.max(0, Math.min(1, avg/5)) * 100;
        const indicator = document.getElementById('indicator');
        indicator.style.left = pct + '%';
      })();

      // Chart render
      (function(){
        const ctx = document.getElementById('kpiChart').getContext('2d');
        const labels = ${JSON.stringify(monthsShort)};
        const data = ${JSON.stringify(trendParts)};
        // compute line for available points; show dotted prediction if later months missing (simple approach)
        const providedCount = data.filter(v=>v!=null).length;
        const actual = data.slice(0, providedCount);
        const future = data.map((v,i)=> i>=providedCount ? null : null); // not used directly

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: '${company}',
              data: data,
              borderColor: '#0077cc',
              backgroundColor: 'rgba(0,123,204,0.06)',
              tension: 0.3,
              pointRadius:5,
              pointBackgroundColor:'#004b91',
              borderWidth: 3,
              spanGaps: true
            }]
          },
          options: {
            responsive:true,
            maintainAspectRatio:false,
            scales:{
              y:{ suggestedMin: 2.5, suggestedMax: 4.5 }
            },
            plugins:{ legend:{display:false} }
          }
        });
      })();
    </script>
  </body></html>`;

  // open new tab and write
  const win = window.open('', '_blank');
  win.document.open();
  win.document.write(html);
  win.document.close();

  // helper function in outer scope
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
});
