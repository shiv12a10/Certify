require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./configs/Database");
const cookieParser = require("cookie-parser");
connectDB();

const { adminRoutes, userRoutes } = require("./routes");
const { default: axios } = require("axios");
const { APP_URL } = require("./configs");

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cors({
    origin: [APP_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.get("/api/pdf-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.set("Content-Type", "application/pdf");
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching the PDF");
  }
});

app.get("/api/ping", async(req,res) => {
  res.status(200).json({success : true, message: "Endpoint Health Check"})
})

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

const PORT = process.env.APP_PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
