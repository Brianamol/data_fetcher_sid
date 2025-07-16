require("dotenv").config();
const cron = require("node-cron");
const notifyPostDueLoans = require("../schedulers/qLoanNotifier");
const notifyPreListingLoans = require("../schedulers/qLoanPreListingNotifier");
const notifyListingLoans = require("../schedulers/qLoanListingNotifier");

console.log("⏱️ QLoan scheduler initialized");

// Run immediately on start (for testing)
(async () => {
  await notifyPostDueLoans();
  await notifyPreListingLoans();
  await notifyListingLoans();
})();

// Schedule: Run daily at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running scheduled QLoan notifier...");

  await notifyPostDueLoans();
  await notifyPreListingLoans();
  await notifyListingLoans();
});
