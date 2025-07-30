const companies = document.querySelectorAll('.company');
const monthSelect = document.getElementById('month-select');
const reportBox = document.getElementById('report-box');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');

let selectedCompany = '';
let selectedMonth = '';

// Handle company button clicks
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    tryShowReport();
  });
});

// Handle month selection
monthSelect.addEventListener('change', () => {
  selectedMonth = monthSelect.value;
  tryShowReport();
});

// Show report if both selected
function tryShowReport() {
  if (selectedCompany && selectedMonth) {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;
    reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;

    reportBox.classList.remove('hidden');
    setTimeout(() => {
      reportBox.classList.add('show');
    }, 10);
  }
}
