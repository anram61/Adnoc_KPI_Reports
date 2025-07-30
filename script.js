const companies = document.querySelectorAll('.company');
const monthSelect = document.getElementById('month-select');
const reportBox = document.getElementById('report-box');
const reportCompany = document.getElementById('report-company');
const reportMonth = document.getElementById('report-month');
const reportText = document.getElementById('report-text');
const pdfContainer = document.getElementById('pdf-container');
const pdfFrame = document.getElementById('pdf-frame');

let selectedCompany = '';
let selectedMonth = '';

function displayReport() {
  if (selectedCompany && selectedMonth) {
    reportCompany.textContent = selectedCompany;
    reportMonth.textContent = selectedMonth;

    if (selectedCompany === "Adnoc Offshore") {
      pdfContainer.classList.remove('hidden');
      pdfFrame.src = "reports/offshore-report.pdf";
      reportText.textContent = "";
    } else {
      pdfContainer.classList.add('hidden');
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
