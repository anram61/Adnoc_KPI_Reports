document.getElementById('reportForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const company = document.getElementById('company').value;
    const month = document.getElementById('month').value;
    const efficiency = parseFloat(document.getElementById('efficiency').value);
    const people = parseFloat(document.getElementById('people').value);
    const operations = parseFloat(document.getElementById('operations').value);
    const financials = parseFloat(document.getElementById('financials').value);
    const topKpi = document.getElementById('topKpi').value;
    const underKpi = document.getElementById('underKpi').value;
    const remedial = document.getElementById('remedial').value;

    const overallScore = ((efficiency + people + operations + financials) / 4).toFixed(2);

    // Placeholder leaderboard scores
    const leaderboard = [
        { name: "AGT", score: 3.00 },
        { name: "Adnoc Onshore", score: 3.19 },
        { name: "Adnoc Offshore", score: 3.91 },
        { name: "Adnoc Distribution", score: 3.20 },
        { name: "Adnoc Gas", score: 3.75 },
        { name: "Adnoc Sour Gas", score: 3.68 },
        { name: "Refining", score: 4.44 },
        { name: "Borouge", score: 3.21 },
        { name: "Al Dhafra & Yasat", score: 3.51 },
        { name: "Adnoc L&S", score: 3.65 },
        { name: "Adnoc Drilling", score: 3.88 }
    ];

    const reportHTML = `
    <div style="font-family: Arial, sans-serif; background: white; padding: 20px; border-radius: 8px; max-width: 1200px; margin: auto; color: #333;">
        <h2 style="margin-bottom: 5px;">Group Digital 2025</h2>
        <h3 style="margin-top: 0; color: gray;">BSC – ${month} (Mid-Year)</h3>
        <h1 style="margin: 5px 0;">${company} YTD</h1>
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Solid Performance <span style="color: #004b91;">${overallScore}/5</span></div>

        <!-- KPI Bar -->
        <div style="display: flex; margin-bottom: 15px; font-size: 12px; text-align: center;">
            <div style="flex: 1; background: #1565c0; color: white; padding: 4px;">Needs improvement</div>
            <div style="flex: 1; background: #2196f3; color: white; padding: 4px;">Underperforming</div>
            <div style="flex: 1; background: #1976d2; color: white; padding: 4px;">Solid Performance</div>
            <div style="flex: 1; background: #64b5f6; color: white; padding: 4px;">Exceed Expectation</div>
            <div style="flex: 1; background: #90caf9; color: white; padding: 4px;">Outstanding</div>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <!-- Pillars -->
            <div style="flex: 3; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
                <div>
                    <div>Efficiency</div>
                    <div style="color: green; font-size: 20px; font-weight: bold;">${efficiency}/5</div>
                </div>
                <div>
                    <div>People</div>
                    <div style="color: red; font-size: 20px; font-weight: bold;">${people}/5</div>
                </div>
                <div>
                    <div>Profitability - Operations</div>
                    <div style="color: #1565c0; font-size: 20px; font-weight: bold;">${operations}/5</div>
                </div>
                <div>
                    <div>Profitability - Financials</div>
                    <div style="color: orange; font-size: 20px; font-weight: bold;">${financials}/5</div>
                </div>
            </div>

            <!-- Leaderboard -->
            <div style="flex: 2;">
                <h4 style="margin-bottom: 5px; color: #004b91;">Leadership Score Board</h4>
                ${leaderboard.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 4px; border-bottom: 1px solid #ddd;">
                        <span>${item.name}</span>
                        <span style="background: #e0f2f1; padding: 2px 6px; border-radius: 4px;">${item.score}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Chart -->
        <canvas id="kpiChart" style="width:100%; height:250px; margin-bottom: 20px;"></canvas>

        <!-- Bottom Boxes -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; background: #f9f9f9;">
                <h4 style="color: green;">Top KPIs</h4>
                <p>${topKpi.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; background: #fff8f8;">
                <h4 style="color: red;">Under Performing KPIs</h4>
                <p>${underKpi.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; background: #f9f9f9;">
                <h4>Recommendation</h4>
                <p>${remedial.replace(/\n/g, '<br>')}</p>
            </div>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: gray;">All figures subject to GBDO approval*</p>
    </div>
    `;

    // Open in new tab
    const newWindow = window.open();
    newWindow.document.write(`<html><head><title>${company} - ${month} Report</title></head><body>${reportHTML}<script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script><script>
        const ctx = document.getElementById('kpiChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                datasets: [{
                    label: '${company}',
                    data: [3.2, 3.5, 3.4, 3.3, 3.1, ${overallScore}, null, null, null, null, null, null],
                    borderColor: '#1565c0',
                    backgroundColor: '#90caf9',
                    fill: false,
                    tension: 0.3
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    <\/script></body></html>`);
});
