const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');

let selectedCompany = '';

function displayReport() {
  if (selectedCompany) {
    reportCompany.textContent = selectedCompany;

    let pdfPath = '';

    if (selectedCompany === 'Adnoc Offshore') {
      pdfPath = 'reports/offshore-report.pdf';
    } else if (selectedCompany === 'Adnoc Global Trading') {
      pdfPath = 'reports/AGT.pdf';
    } else if (selectedCompany === 'Year to date Average') {
      pdfPath = 'reports/YTD.pdf';
    }

    if (pdfPath) {
      reportText.innerHTML = `
        <div class="responsive-iframe-container">
          <iframe 
            src="${pdfPath}#view=FitH&toolbar=0&navpanes=0&scrollbar=0" 
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
