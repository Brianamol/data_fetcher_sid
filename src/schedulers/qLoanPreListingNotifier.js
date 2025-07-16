const db = require("../db");
const sendToQueue = require("../queue/sendToQueue");
const resolvePhone = require("../utils/resolvePhone");

async function notifyPreListingLoans() {
  try {
    const [rows] = await db.execute("SELECT * FROM QLOANS WHERE ParDays = '7'");

    for (const loan of rows) {
      const payload = {
        phone: resolvePhone(loan.CUSTID),
        message: `Dear ${loan.CUSTOMERNAME}, please note that in pursuant to Regulation 50(1) of the Credit Reference Bureau Regulations 2013, you will be listed with all Credit Reference Bureaus for default of your Q-Loan amount of KES ${loan.LOANBALANCE}`,
        type: "qloan_prelisting",
        custId: loan.CUSTID,
      };

      await sendToQueue(payload);
      console.log("✅ Sent to queue:", payload);
    }

    console.log(`✅ Sent ${rows.length} QLoan pre-listing notices`);
  } catch (err) {
    console.error("❌ Error in notifyPreListingLoans:", err.message);
  }
}

module.exports = notifyPreListingLoans;
