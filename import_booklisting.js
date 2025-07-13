const xlsx = require("xlsx");
const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
  try {
    // Load Excel
    const workbook = xlsx.readFile("booklisting_20250521.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📄 Loaded ${data.length} records from Excel.`);

    // Connect to MySQL
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // Insert into MySQL
    for (const row of data) {
      const client_id = row.ClientID ?? null;
      const accountnumber = row.AccountNumber ?? null;
      const accountname = row.CustomerName ?? row.Name ?? null;
      const telephone = row.Telephone ?? null;

      await conn.execute(
        `INSERT INTO booklisting (client_id, accountnumber, accountname, telephone)
         VALUES (?, ?, ?, ?)`,
        [client_id, accountnumber, accountname, telephone]
      );
    }

    await conn.end();
    console.log("✅ Done importing booklisting data.");
  } catch (err) {
    console.error("❌ Import error:", err.message);
  }
})();
