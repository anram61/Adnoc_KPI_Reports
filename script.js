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

// Populate company buttons
companies.forEach(company => {
  const button = document.createElement('button');
  button.className = 'company-button';
  button.textContent = company;
  button.addEventListener('click', () => {
    selectedCompany = company;
    document.querySelectorAll('.company-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    tryShowReport(); // Try to show report when company is selected
  });
  companyContainer.appendChild(button);
});

// Populate month dropdown
months.forEach(month => {
  const option = document.createElement('option');
  option.value = month;
  option.textContent = month;
  monthSelect.appendChild(option);
});

// Trigger on month select
monthSelect.addEventListener('change', (e) => {
  selectedMonth = e.target.value;
  tryShowReport(); // Try to show report when month is selected
});

// Show report if both selections are made
function tryShowReport() {
  if (selectedCompany && selectedMonth) {
    const fileName = `${selectedCompany.toLowerCase().replace(/ /g, '_')}_${selectedMonth.toLowerCase().replace(' ', '')}`;
    const pdfPath = `reports/${fileName}.pdf`;
    const imgPath = `reports/${fileName}.png`;

    reportContainer.innerHTML = `
      <div class="report-box">
        <h3>📂 Report Summary</h3>
        <p><strong>Company:</strong> ${selectedCompany}</p>
        <p><strong>Month:</strong> ${selectedMonth}</p>
        <embed src="${pdfPath}" type="application/pdf" width="100%" height="600px" onerror="this.style.display='none'; document.getElementById('fallback-${fileName}').style.display='block';" />
        <img id="fallback-${fileName}" src="${imgPath}" alt="KPI Report Image" style="display:none; max-width:100%; height:auto;" />
      </div>
    `;
  }
}
