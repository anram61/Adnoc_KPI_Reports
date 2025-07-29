let selectedCompany = "";

document.querySelectorAll(".company-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedCompany = btn.innerText;
    document.querySelectorAll(".company-buttons button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function viewReport() {
  const month = document.getElementById("monthSelect").value;
  if (!selectedCompany) {
    alert("Please select a company.");
    return;
  }
  document.getElementById("selectedCompany").textContent = selectedCompany;
  document.getElementById("selectedMonth").textContent = month;
  document.getElementById("placeholderText").textContent =
    `This is a placeholder for the KPI summary for ${selectedCompany} in ${month}.`;

  document.getElementById("report-summary").classList.remove("hidden");
}
