require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect("mongodb://sdadmin:sdadmin123@sample-cluster.node.us-east-1.docdb.amazonaws.com:27017/sample-database?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false", {
    ssl: true,
    tlsCAFile: "./global-bundle.pem",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/voting", require("./routes/votingRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/feedbacks", require("./routes/feedbackRoutes"));
app.use("/api/emergencyServices", require("./routes/emergencyServiceRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
