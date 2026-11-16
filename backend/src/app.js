
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route utama
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Aloka Backend API is running"
    });
});

// Menjalankan server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Aloka Backend running on port ${PORT}`);
});
