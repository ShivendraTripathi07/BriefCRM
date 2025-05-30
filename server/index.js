const express = require("express");
const cors = require("cors");
require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");

const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use(bodyParser.json({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "your-production-domain"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/user", userRoutes);

// Connnection

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
  } catch (err) {
    console.log("Error in connecting to the database");
    console.log(err);
  }
};

const PORT = process.env.PORT;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Mongodb Connected");
    console.log(`Server is running on port ${PORT}`);
  });
});
