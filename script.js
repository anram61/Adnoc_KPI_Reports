const companies = document.querySelectorAll('.company');
const monthSelect = document.getElementById('month-select');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');

let selectedCompany = '';
let selectedMonth = '';

function displayReport() {
  if (selectedCompany && selectedMonth) {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;

    if (selectedCompany === 'Adnoc Offshore') {
      // Embed the PDF with no internal scroll (large height)
     reportText.innerHTML = `
  <div class="pdf-container">
    <iframe src="reports/offshore-report.pdf#toolbar=0"></iframe>
  </div>
`;

    } else if (selectedCompany === 'Year to date Average') {
      // Custom message for YTD average
      reportText.innerHTML = `
        <strong>This section will display the Year-to-Date performance summary when available.</strong>
      `;
    } else {
      // Default placeholder
      reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
    }
  }
}

companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    displayReport();
  });
});

monthSelect.addEventListener('change', () => {
  selectedMonth = monthSelect.value;
  displayReport();
});
