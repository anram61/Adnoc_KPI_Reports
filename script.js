const companies = document.querySelectorAll('.company');
const monthSelect = document.getElementById('month-select');
const reportBox = document.getElementById('report-box');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');
const reportContent = document.getElementById('report-content');

let selectedCompany = '';
let selectedMonth = '';

function displayReport() {
  if (selectedCompany && selectedMonth) {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;

    // Clear previous content
    reportContent.innerHTML = '';

    // Check for special case
    if (selectedCompany === 'Adnoc Offshore') {
      const iframe = document.createElement('iframe');
      iframe.src = 'Performance Dashboard - Offshore-web.pdf';
      iframe.width = '100%';
      iframe.height = '500px';
      iframe.style.border = 'none';
      reportContent.appendChild(iframe);
    } else {
      const text = document.createElement('p');
      text.id = 'report-text';
      text.textContent = `This is a placeholder for the KPI summary for ${selectedCompany} in ${selectedMonth}.`;
      reportContent.appendChild(text);
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
