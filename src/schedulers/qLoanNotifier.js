const db = require("../db");
const sendToQueue = require("../queue/sendToQueue");

async function notifyPostDueLoans() {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM QLOANS WHERE ParDays IN ('1', '7', '24')"
    );

    let sent = 0;

    for (const loan of rows) {
      let payload;
      const par = loan.ParDays?.trim();

      if (par === "1") {
        payload = {
          phone: resolvePhone(loan.CUSTID),
          message: `Dear ${loan.CUSTOMERNAME}, your Q-Loan of KES ${loan.LOANBALANCE} is due on ${loan.REPORTDATE}. Please log-in to SidianVIBE and select Q-Loan option to pay. Non-payment will attract a charge of 4.65% on amount due.`,
          type: "qloan_post_due",
          custId: loan.CUSTID,
        };
      } else if (par === "7") {
        payload = {
          phone: resolvePhone(loan.CUSTID),
          message: `Dear ${loan.CUSTOMERNAME}, please note that in pursuant to Regulation 50(1) of the Credit Reference Bureau Regulations 2013, you will be listed with all Credit Reference Bureaus for default of your Q-Loan amount of KES ${loan.LOANBALANCE}`,
          type: "qloan_pre_listing",
          custId: loan.CUSTID,
        };
      } else if (par === "24") {
        payload = {
          phone: resolvePhone(loan.CUSTID),
          message: `Dear ${loan.CUSTOMERNAME}, this is a final demand notice to pay your Q-Loan of KES ${loan.LOANBALANCE}, failure to which you will be listed on CRB.`,
          type: "qloan_listing_notice",
          custId: loan.CUSTID,
        };
      }

      if (payload) {
        await sendToQueue(payload);
        sent++;
        console.log("✅ Sent to queue:", payload);
      }
    }

    console.log(`✅ Sent ${sent} QLoan notifications to queue`);
  } catch (err) {
    console.error("❌ Error in notifyPostDueLoans:", err.message);
  }
}

function resolvePhone(custId) {
  // Temporary fake resolution — you’ll replace this later with proper logic.
  return "+254712345678";
}
module.exports = notifyPostDueLoans;
