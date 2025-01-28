const axios = require("axios");
const PaymentLog = require("../models/paymentLog");
const Schedule = require("../models/schedule");

class PaymentService {
  constructor() {
    this.baseUrl = process.env.BKASH_API_URL;
    this.token = null; // Authentication token
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/token`, {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      });
      this.token = response.data.token;
    } catch (error) {
      console.error("Authentication failed:", error.message);
      throw new Error("Failed to authenticate with bKash");
    }
  }

  async processPayment(schedule) {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/payment`,
        {
          amount: schedule.amount,
          recipient: schedule.recipientAccount,
          reference: schedule.reference,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      // Log success
      await PaymentLog.create({
        scheduleId: schedule._id,
        userId: schedule.userId,
        type: schedule.type,
        amount: schedule.amount,
        status: "Success",
        message: "Payment successful",
      });

      await Schedule.updateOne({ _id: schedule._id }, { status: "Completed" });
    } catch (error) {
      console.error(`Payment failed for ${schedule.type}:`, error.message);

      // Log failure
      await PaymentLog.create({
        scheduleId: schedule._id,
        userId: schedule.userId,
        type: schedule.type,
        amount: schedule.amount,
        status: "Failed",
        message: error.message,
      });

      await Schedule.updateOne({ _id: schedule._id }, { status: "Failed" });
    }
  }
}

module.exports = new PaymentService();
