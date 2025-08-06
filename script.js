const companies = document.querySelectorAll('.company');
const reportCompany = document.getElementById('report-company');
const reportText = document.getElementById('report-text');
const monthDropdown = document.getElementById('month-dropdown');

let selectedCompany = '';
let selectedMonth = '';

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
};

function displayReport() {
  if (selectedCompany) {
    reportCompany.textContent = selectedCompany;

    let pdfPath = "";

    if (selectedMonth && reportPDFs[selectedCompany]?.[selectedMonth]) {
      pdfPath = reportPDFs[selectedCompany][selectedMonth];
    } else if (reportPDFs[selectedCompany]?.default) {
      pdfPath = reportPDFs[selectedCompany].default;
    }

    if (pdfPath) {
      reportText.innerHTML = `
        <div class="responsive-iframe-container">
          <embed 
            src="${pdfPath}#view=FitH&toolbar=0&navpanes=0&scrollbar=0" 
            type="application/pdf">
          </embed>
        </div>`;
    } else {
      reportText.innerHTML = `
        <p>No KPI report found for <strong>${selectedCompany}</strong> ${
        selectedMonth ? "in " + selectedMonth : ""
      }.</p>`;
    }
  }
}

// Company button click
companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    displayReport();
  });
});

// Month dropdown change
monthDropdown.addEventListener('change', () => {
  selectedMonth = monthDropdown.value;
  displayReport();
});
