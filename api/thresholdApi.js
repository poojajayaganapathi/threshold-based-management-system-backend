const express = require("express")
const Threshold = require("../models/thresholdModel")
const auth = require("../middlewares/auth")
const authorize = require("../middlewares/roleAuth")

const router = express.Router()

// GET /api/thresholds - Get all thresholds (ADMIN only)
router.get("/", auth, authorize("ADMIN"), async (req, res) => {
    try {
        const thresholds = await Threshold.find()
            .populate("createdBy", "firstname lastname email")
            .sort({ createdAt: -1 })
        return res.json(thresholds)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

// POST /api/thresholds - Create a new threshold (ADMIN only)
router.post("/", auth, authorize("ADMIN"), async (req, res) => {
    try {
        const { parameterName, minValue, maxValue } = req.body

        if (!parameterName || minValue === undefined || maxValue === undefined) {
            return res.status(400).json({ message: "parameterName, minValue, and maxValue are required" })
        }

        if (minValue >= maxValue) {
            return res.status(400).json({ message: "minValue must be less than maxValue" })
        }

        const threshold = new Threshold({
            parameterName,
            minValue,
            maxValue,
            createdBy: req.userId
        })

        await threshold.save()
        return res.status(201).json({ message: "Threshold created successfully", threshold })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

// PUT /api/thresholds/:id - Update a threshold (ADMIN only)
router.put("/:id", auth, authorize("ADMIN"), async (req, res) => {
    try {
        const { parameterName, minValue, maxValue, isActive } = req.body

        const threshold = await Threshold.findById(req.params.id)
        if (!threshold) {
            return res.status(404).json({ message: "Threshold not found" })
        }

        if (minValue !== undefined && maxValue !== undefined && minValue >= maxValue) {
            return res.status(400).json({ message: "minValue must be less than maxValue" })
        }

        if (parameterName !== undefined) threshold.parameterName = parameterName
        if (minValue !== undefined) threshold.minValue = minValue
        if (maxValue !== undefined) threshold.maxValue = maxValue
        if (isActive !== undefined) threshold.isActive = isActive

        await threshold.save()
        return res.json({ message: "Threshold updated successfully", threshold })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

// DELETE /api/thresholds/:id - Delete a threshold (ADMIN only)
router.delete("/:id", auth, authorize("ADMIN"), async (req, res) => {
    try {
        const threshold = await Threshold.findById(req.params.id)
        if (!threshold) {
            return res.status(404).json({ message: "Threshold not found" })
        }

        await Threshold.findByIdAndDelete(req.params.id)
        return res.json({ message: "Threshold deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
