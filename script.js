const companies = [
  "Adnoc Onshore", "Adnoc Offshore", "Adnoc Al Dhafra & Al Yasat",
  "Adnoc Drilling", "Adnoc Sour Gas", "Adnoc Refining", "Adnoc Distribution",
  "Adnoc Borouge", "Adnoc L & S", "Adnoc Global Trading", "Adnoc LNG", "Adnoc Taziz"
];

const months = [
  "January 2025", "February 2025", "March 2025",
  "April 2025", "May 2025", "June 2025"
];

const companyContainer = document.getElementById('company-container');
const monthSelect = document.getElementById('month-select');
const reportContainer = document.getElementById('report-container');

let selectedCompany = null;
let selectedMonth = null;

// Create company buttons
companies.forEach(company => {
  const button = document.createElement('button');
  button.className = 'company-button';
  button.textContent = company;
  button.addEventListener('click', () => {
    selectedCompany = company;
    document.querySelectorAll('.company-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    showReportIfReady();
  });
  companyContainer.appendChild(button);
});

// Create month dropdown
months.forEach(month => {
  const option = document.createElement('option');
  option.value = month;
  option.textContent = month;
  monthSelect.appendChild(option);
});

// Month selection
monthSelect.addEventListener('change', (e) => {
  selectedMonth = e.target.value;
  showReportIfReady();
});

// Show report when both values are selected
function showReportIfReady() {
  if (!selectedCompany || !selectedMonth) return;

  const fileName = `${selectedCompany.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and')}_${selectedMonth.toLowerCase().replace(/ /g, '')}`;
  const pdfPath = `reports/${fileName}.pdf`;
  const imgPath = `reports/${fileName}.png`;

  reportContainer.innerHTML = `
    <div class="report-box">
      <h3>📁 Report Summary</h3>
      <p><strong>Company:</strong> ${selectedCompany}</p>
      <p><strong>Month:</strong> ${selectedMonth}</p>
      <embed src="${pdfPath}" type="application/pdf" width="100%" height="600px" onerror="this.style.display='none'; document.getElementById('fallback-${fileName}').style.display='block';" />
      <img id="fallback-${fileName}" src="${imgPath}" alt="KPI Report" style="display:none; max-width:100%; height:auto;" />
    </div>
  `;
}
