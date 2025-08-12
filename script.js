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
  },
  "Adnoc Onshore": {
    default: "reports/onshore.pdf"
  },
"Adnoc Al Dhafra & Al Yasat": {
    default: "reports/alds.pdf"
  },
"Adnoc Drilling": {
    default: "reports/drilling.pdf"
  },
"Adnoc Sour Gas": {
    default: "reports/sourgas.pdf"
  },
"Adnoc Refining": {
    default: "reports/refining.pdf"
  },
"Adnoc Distribution": {
    default: "reports/distribution.pdf"
  },
"Adnoc Borouge": {
    default: "reports/borouge.pdf"
  },
"Adnoc L&S": {
    default: "reports/L&S.pdf"
  },
"GBDO": {
    default: "reports/gbdo.pdf"
  },
"Adnoc Gas": {
    default: "reports/adnocgas.pdf"
  },
};

function displayReport() {
  if (!selectedCompany) return;

  reportCompany.textContent = selectedCompany;

  const baseFolder = "reports";
  const selected = selectedMonth || "default";
  const folderName = selectedCompany.replace(/ /g, "%20");
  const fileName = `${selected}.html`;
  const fallbackPDF = reportPDFs[selectedCompany]?.[selected] || reportPDFs[selectedCompany]?.default;

  const htmlPath = `${baseFolder}/${folderName}/${fileName}`;

  fetch(htmlPath)
    .then(response => {
      if (response.ok) {
        reportText.innerHTML = `
          <p><em>Showing dashboard report for <strong>${selected} 2025</strong>.</em></p>
          <div class="responsive-iframe-container">
            <iframe src="${htmlPath}" frameborder="0"></iframe>
          </div>
        `;
      } else if (fallbackPDF) {
        reportText.innerHTML = `
          <p><em>Dashboard not found. Showing fallback PDF instead.</em></p>
          <div class="responsive-iframe-container">
            <embed src="${fallbackPDF}#view=FitH&toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" />
          </div>
        `;
      } else {
        reportText.innerHTML = `<p>No KPI report found for <strong>${selectedCompany}</strong> in <strong>${selected}</strong>.</p>`;
      }
    })
    .catch(() => {
      reportText.innerHTML = `<p>Error loading report.</p>`;
    });
}

companies.forEach(button => {
  button.addEventListener('click', () => {
    selectedCompany = button.getAttribute('data-company');
    selectedMonth = '';
    monthDropdown.value = '';
    displayReport();
  });
});

monthDropdown.addEventListener('change', () => {
  selectedMonth = monthDropdown.value;
  displayReport();
});
