const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');
const monthSelect = document.getElementById('month-select');

let selectedCompany = '';
let selectedMonth = '';

function updateReport() {
  if (selectedCompany && selectedMonth && selectedMonth !== "Select Month") {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;
    reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
  }
}

companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    updateReport();
  });
});

monthSelect.addEventListener('change', () => {
  selectedMonth = monthSelect.value;
  updateReport();
});
