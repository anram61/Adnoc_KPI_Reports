let selectedCompany = '';
let selectedMonth = '';

document.querySelectorAll('.company-btn').forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.textContent;
    updateReport();
  });
});

document.getElementById('month-select').addEventListener('change', (e) => {
  selectedMonth = e.target.value;
  updateReport();
});

function updateReport() {
  const companySpan = document.getElementById('selected-company');
  const monthSpan = document.getElementById('selected-month');
  const reportText = document.getElementById('report-text');

  companySpan.textContent = selectedCompany || 'N/A';
  monthSpan.textContent = selectedMonth || 'N/A';

  if (selectedCompany && selectedMonth) {
    reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
  } else {
    reportText.textContent = 'Please select a company and month to see the KPI summary.';
  }
}
