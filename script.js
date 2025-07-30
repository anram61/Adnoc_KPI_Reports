const companies = document.querySelectorAll('.company');
const monthSelect = document.getElementById('month-select');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');
const reportBox = document.getElementById('report-box');

let selectedCompany = '';
let selectedMonth = '';

function displayReport() {
  if (selectedCompany && selectedMonth) {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;

    if (selectedCompany === 'Adnoc Offshore') {
      // Show the PDF inside the page using <embed>
      reportText.innerHTML = `
        <embed 
          src="reports/offshore-report.pdf#toolbar=0&navpanes=0" 
          type="application/pdf" 
          width="100%" 
          height="1800px" 
          style="border: none; display: block; margin: 0 auto;" />
      `;
    } else if (selectedCompany === 'Year to date Average') {
      reportText.innerHTML = `
        <strong>This section will display the Year-to-Date performance summary when available.</strong>
      `;
    } else {
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
