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
      // Remove padding from report box for seamless scroll
      reportBox.style.padding = "0";
      reportBox.style.border = "none";
      reportBox.style.boxShadow = "none";

      // Show full embedded PDF, flowing naturally in page
      reportText.innerHTML = `
        <embed src="reports/offshore-report.pdf#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" width="100%" height="1800px" style="display: block;" />
      `;
    } else {
      // Restore default styles
      reportBox.style.padding = "10px";
      reportBox.style.borderLeft = "6px solid orange";
      reportBox.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";

      if (selectedCompany === 'Year to date Average') {
        reportText.innerHTML = `
          <strong>This section will display the Year-to-Date performance summary when available.</strong>
        `;
      } else {
        reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
      }
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
