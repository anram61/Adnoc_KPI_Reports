document.getElementById("report-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const company = document.getElementById("company").value;
  const month = document.getElementById("month").value;
  const p1 = parseFloat(document.getElementById("pillar1").value);
  const p2 = parseFloat(document.getElementById("pillar2").value);
  const p3 = parseFloat(document.getElementById("pillar3").value);
  const p4 = parseFloat(document.getElementById("pillar4").value);

  const kpiRating = ((p1 + p2 + p3 + p4) / 4).toFixed(2);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${company} - ${month} KPI Report</title>
      <link rel="stylesheet" href="dashboard-style.css" />
    </head>
    <body>
      <div class="dashboard-report">
        <h1>${company}</h1>
        <h2>${month} 2025 Performance Dashboard</h2>
        <div class="kpi-score">KPI Rating: <strong>${kpiRating}</strong></div>
        <hr/>
        <h3>Pillar Ratings</h3>
        <ul>
          <li>Pillar 1: ${p1}</li>
          <li>Pillar 2: ${p2}</li>
          <li>Pillar 3: ${p3}</li>
          <li>Pillar 4: ${p4}</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  const newTab = window.open();
  newTab.document.open();
  newTab.document.write(html);
  newTab.document.close();
});
