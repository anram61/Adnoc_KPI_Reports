const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');

let selectedCompany = '';
let selectedMonth = '';

// Map of available reports
const reportPDFs = {
  "Adnoc Offshore": {
    default: "reports/offshore-report.pdf"
  },
  "Adnoc Global Trading": {
    default: "reports/AGT.pdf"
  },
  "Year to date Average": {
    default: "reports/YTD.pdf"
  }
  // Add more companies here if needed
};

function displayReport() {
  if (selectedCompany) {
    reportCompany.textContent = selectedCompany + " (Latest Report)";

    const selectedMonth = document.getElementById("month-dropdown").value;
    let pdfPath = "";

    if (selectedCompany === 'Adnoc Offshore') {
      pdfPath = 'reports/offshore-report.pdf';
    } else if (selectedCompany === 'Adnoc Global Trading') {
      pdfPath = 'reports/AGT.pdf';
    } else if (selectedCompany === 'Year to date Average') {
      pdfPath = 'reports/YTD.pdf';
    }

    // Use Google Docs Viewer for compatibility
    if (pdfPath) {
      const fullUrl = `${location.origin}/${pdfPath}`;
      reportText.innerHTML = `
        <div class="responsive-iframe-container">
          <iframe 
            src="https://docs.google.com/gview?embedded=true&url=${fullUrl}" 
            frameborder="0">
          </iframe>
        </div>`;
    } else {
      reportText.innerHTML = `
        <p>This is a placeholder for the KPI summary for <strong>${selectedCompany}</strong>.</p>`;
    }
  }
}

// Handle company selection
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    selectedMonth = ''; // Reset to default (latest)
    monthDropdown.value = ''; // Reset dropdown
    displayReport();
  });
});

// Handle month selection
monthDropdown.addEventListener('change', () => {
  selectedMonth = monthDropdown.value;
  displayReport();
});
