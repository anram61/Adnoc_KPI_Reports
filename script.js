const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');

let selectedCompany = '';
let selectedMonth = '';

companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
  });
});

document.getElementById('view-report').addEventListener('click', () => {
  selectedMonth = document.getElementById('month-select').value;
  if (!selectedCompany) {
    alert('Please select a company.');
    return;
  }
  reportCompany.textContent = selectedCompany;
  reportMonth.textContent = selectedMonth;
  reportText.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
});
