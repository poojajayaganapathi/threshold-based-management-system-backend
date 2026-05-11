require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

// Import route files
const userApi = require("./api/userApi")
const requestApi = require("./api/requestApi")
const thresholdApi = require("./api/thresholdApi")
const valueApi = require("./api/valueApi")
const alertApi = require("./api/alertApi")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to database
connectDB()

// API Routes
app.use("/api/auth", userApi)
app.use("/api/thresholds", thresholdApi)
app.use("/api/values", valueApi)
app.use("/api/alerts", alertApi)

// Keep existing routes for backward compatibility
app.use("/users", userApi)
app.use("/requests", requestApi)

// Health check route
app.get("/", (req, res) => {
    res.json({ message: "Threshold-Based Alert Management System API is running" })
})

if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on port", process.env.PORT || 3000)
    })
}

module.exports = app