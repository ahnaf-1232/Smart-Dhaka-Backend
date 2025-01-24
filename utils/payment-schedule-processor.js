const cron = require("node-cron");
const Schedule = require("./models/schedule");
const PaymentService = require("./services/paymentService");

// Cron job to process payments daily at midnight
cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

  try {
    const schedules = await Schedule.find({ date: today, status: "Pending" });

    for (const schedule of schedules) {
      await PaymentService.processPayment(schedule);
    }
  } catch (error) {
    console.error("Error processing scheduled payments:", error.message);
  }
});
