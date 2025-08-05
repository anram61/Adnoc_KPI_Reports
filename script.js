const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');

let selectedCompany = '';

function displayReport() {
  if (selectedCompany) {
    reportCompany.textContent = selectedCompany;

    if (selectedCompany === 'Adnoc Offshore') {
      reportText.innerHTML = `
        <div class="responsive-iframe-container">
          <iframe 
            src="reports/offshore-report.pdf#toolbar=0" 
            frameborder="0"></iframe>
        </div>`;
    } else if (selectedCompany === 'Adnoc Global Trading') {
      reportText.innerHTML = `
        <div class="responsive-iframe-container">
          <iframe 
            src="reports/AGT.pdf#toolbar=0" 
            frameborder="0"></iframe>
        </div>`;
    } else if (selectedCompany === 'Year to date Average') {
      reportText.innerHTML = `
        <div class="responsive-iframe-container">
          <iframe 
            src="reports/YTD.pdf#toolbar=0" 
            frameborder="0"></iframe>
        </div>`;
    } else {
      reportText.innerHTML = `
        <p>This is a placeholder for the KPI summary for <strong>${selectedCompany}</strong>.</p>`;
    }
  }
}

companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    displayReport();
  });
});
