const db = require("../db");
const sendToQueue = require("../queue/sendToQueue");

async function notifyListingLoans() {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM QLOANS WHERE ParDays = '24'"
    );
    let sent = 0;

    for (const loan of rows) {
      const payload = {
        phone: "+254712345678", // Replace with resolved phone logic
        message: `Dear ${loan.CUSTOMERNAME}, this is a final demand notice to pay your Q-Loan of KES ${loan.LOANBALANCE}, failure to which you will be listed on CRB.`,
        type: "qloan_listing_notice",
        custId: loan.CUSTID,
      };

      await sendToQueue(payload);
      console.log("📣 Sent to queue:", payload);
      sent++;
    }

    console.log(`✅ Sent ${sent} QLoan listing notices`);
  } catch (err) {
    console.error("❌ Error in notifyListingLoans:", err.message);
  }
}

module.exports = notifyListingLoans;
