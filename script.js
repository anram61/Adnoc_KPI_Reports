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
     reportText.innerHTML = `
  <iframe 
    src="reports/offshore-report.pdf#toolbar=0" 
    width="100%" 
    height="1200px" 
    style="border: none;"></iframe>
`;

    } else if (selectedCompany === 'Adnoc Global Trading') {
      reportText.innerHTML = `
        <iframe 
          src="reports/AGT.pdf#toolbar=0" 
          width="100%" 
          height="1200px" 
          style="border: none;"></iframe>
      `;
    } else if (selectedCompany === 'Year to date Average') {
      reportText.innerHTML = `
        <iframe 
          src="reports/YTD.pdf#toolbar=0" 
          width="100%" 
          height="1200px" 
          style="border: none;"></iframe>
      `;
    } else {
      reportText.innerHTML = `
        <p>This is a placeholder for the KPI summary for <strong>${selectedCompany}</strong> in <strong>${selectedMonth}</strong>.</p>
      `;
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
