document.getElementById("report-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const company = document.getElementById("company").value;
  const month = document.getElementById("month").value;
  const ytdScore = document.getElementById("ytdScore").value;
  const topKpis = document.getElementById("topKpis").value;
  const focusKpis = document.getElementById("focusKpis").value;
  const pillars = document.getElementById("pillars").value;
  const summaryLink = document.getElementById("summaryLink").value;

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${company} - ${month} 2025 KPI Dashboard</title>
  <link rel="stylesheet" href="dashboard-style.css" />
</head>
<body>
  <div class="dashboard-wrapper">
    <h1>${company}</h1>
    <h2>KPI Dashboard – ${month} 2025</h2>
    <div class="ytd-box">
      <strong>YTD Score:</strong> ${ytdScore}
    </div>

    <section class="kpi-section">
      <h3>Top KPIs</h3>
      <ul>
        ${topKpis.split("\n").map(kpi => `<li>${kpi}</li>`).join("")}
      </ul>
    </section>

    <section class="kpi-section">
      <h3>Focus Areas / Underperforming KPIs</h3>
      <ul>
        ${focusKpis.split("\n").map(kpi => `<li>${kpi}</li>`).join("")}
      </ul>
    </section>

    <section class="pillar-section">
      <h3>Pillar Ratings</h3>
      <p>${pillars}</p>
    </section>

    <footer class="dashboard-footer">
      <p><a href="${summaryLink}" target="_blank">Executive Summary</a></p>
      <p>Generated via ADNOC KPI Viewer</p>
    </footer>
  </div>
</body>
</html>
`;

  const newWindow = window.open();
  newWindow.document.write(content);
  newWindow.document.close();
});
