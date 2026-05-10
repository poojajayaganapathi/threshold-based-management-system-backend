const express = require("express")
const Alert = require("../models/alertModel")
const auth = require("../middlewares/auth")
const authorize = require("../middlewares/roleAuth")

const router = express.Router()

// GET /api/alerts - Get all alerts (ADMIN only)
router.get("/", auth, authorize("ADMIN"), async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate("generatedBy", "firstname lastname email")
            .sort({ generatedAt: -1 })
        return res.json(alerts)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

// GET /api/alerts/my - Get my alerts (OPERATOR only)
router.get("/my", auth, authorize("OPERATOR"), async (req, res) => {
    try {
        const alerts = await Alert.find({ generatedBy: req.userId })
            .sort({ generatedAt: -1 })
        return res.json(alerts)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
