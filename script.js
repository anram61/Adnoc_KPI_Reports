const companies = document.querySelectorAll('.company');
const monthSelect = document.getElementById('month-select');
const reportBox = document.getElementById('report-box');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');

let selectedCompany = '';
let selectedMonth = '';

// Show report when both selected
function showReportIfReady() {
  if (selectedCompany && selectedMonth) {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;
    reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
    reportBox.classList.remove('hidden');
  }
}

// When company is selected
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    showReportIfReady();
  });
});

// When month is selected
monthSelect.addEventListener('change', () => {
  selectedMonth = monthSelect.value;
  showReportIfReady();
});
