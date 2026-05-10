const express = require("express")
const MonitoredValue = require("../models/monitoredValueModel")
const Threshold = require("../models/thresholdModel")
const Alert = require("../models/alertModel")
const auth = require("../middlewares/auth")
const authorize = require("../middlewares/roleAuth")

const router = express.Router()

// POST /api/values - Submit a monitored value (OPERATOR only)
// This is the CRITICAL route that auto-generates alerts
router.post("/", auth, authorize("OPERATOR"), async (req, res) => {
    try {
        const { parameterName, value } = req.body

        if (!parameterName || value === undefined) {
            return res.status(400).json({ message: "parameterName and value are required" })
        }

        // Step 1: Save the monitored value to database
        const monitoredValue = new MonitoredValue({
            parameterName,
            value,
            submittedBy: req.userId
        })
        await monitoredValue.save()

        // Step 2: Find all active thresholds for this parameter
        const thresholds = await Threshold.find({
            parameterName: parameterName,
            isActive: true
        })

        // Step 3: Auto-generate alerts based on threshold comparison
        const alerts = []

        for (const threshold of thresholds) {
            let status = "NORMAL"
            let message = ""

            if (value < threshold.minValue) {
                status = "LOW_ALERT"
                message = `Value ${value} is below minimum threshold ${threshold.minValue} for ${parameterName}`
            } else if (value > threshold.maxValue) {
                status = "HIGH_ALERT"
                message = `Value ${value} exceeds maximum threshold ${threshold.maxValue} for ${parameterName}`
            } else {
                status = "NORMAL"
                message = `Value ${value} is within normal range (${threshold.minValue} - ${threshold.maxValue}) for ${parameterName}`
            }

            const alert = new Alert({
                parameterName,
                submittedValue: value,
                thresholdMin: threshold.minValue,
                thresholdMax: threshold.maxValue,
                status,
                message,
                monitoredValueId: monitoredValue._id,
                thresholdId: threshold._id,
                generatedBy: req.userId
            })

            await alert.save()
            alerts.push(alert)
        }

        return res.status(201).json({
            message: "Value submitted successfully",
            monitoredValue,
            alertsGenerated: alerts.length,
            alerts
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

// GET /api/values/my - Get my submitted values (OPERATOR only)
router.get("/my", auth, authorize("OPERATOR"), async (req, res) => {
    try {
        const values = await MonitoredValue.find({ submittedBy: req.userId })
            .sort({ submittedAt: -1 })
        return res.json(values)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
