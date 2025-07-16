const XLSX = require("xlsx");
const path = require("path");

// Load the Excel file
const workbook = XLSX.readFile(
  path.join(__dirname, "../../booklisting_20250521.xlsx")
);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet); // Parse as array of objects

function resolvePhone(clientId) {
  const row = data.find((entry) => entry.ClientID === clientId);
  if (!row || !row.Telephone) return null;

  let phone = row.Telephone.toString().trim();

  // Normalize format: 07XXXXXXXX → +2547XXXXXXXX
  if (phone.startsWith("07")) {
    phone = "+254" + phone.slice(1);
  } else if (phone.startsWith("254")) {
    phone = "+" + phone;
  } else if (!phone.startsWith("+")) {
    phone = "+254" + phone;
  }

  return phone;
}

module.exports = resolvePhone;
