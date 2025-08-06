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
  if (!selectedCompany) return;

  reportCompany.textContent = selectedCompany;

  let pdfPath = "";
  let message = "";

  if (selectedMonth && reportPDFs[selectedCompany]?.[selectedMonth]) {
    pdfPath = reportPDFs[selectedCompany][selectedMonth];
    message = `<p>Showing report for <strong>${selectedMonth} 2025</strong>.</p>`;
  } else if (reportPDFs[selectedCompany]?.default) {
    pdfPath = reportPDFs[selectedCompany].default;
    message = `<p><em>Currently showing the latest available report.</em></p>`;
  }

  if (pdfPath) {
    reportText.innerHTML = `
      ${message}
      <div class="responsive-iframe-container">
        <embed 
          src="${pdfPath}#view=FitH&toolbar=0&navpanes=0&scrollbar=0" 
          type="application/pdf" />
      </div>`;
  } else {
    reportText.innerHTML = `
      <p>No KPI report found for <strong>${selectedCompany}</strong>${
        selectedMonth ? " in " + selectedMonth : ""
      }.</p>`;
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
