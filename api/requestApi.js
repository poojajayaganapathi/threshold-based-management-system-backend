const express = require("express")
const Request = require("../models/requestModel")
const auth = require("../middlewares/auth")

const router = express.Router()

//Create Request (OPERATOR)
router.post(
    "/create",
    auth,
    async (req, res) => {

        if (req.role !== "OPERATOR") {
            return res.json({ message: "Operator access only" })
        }

        const { minValue, maxValue } = req.body

        if (minValue === undefined || maxValue === undefined) {
            return res.json({ message: "minValue and maxValue are required" })
        }

        if (minValue >= maxValue) {
            return res.json({ message: "minValue must be less than maxValue" })
        }

        const request = new Request({
            minValue,
            maxValue,
            requestedBy: req.userId
        })

        await request.save()

        return res.json({
            message: "Threshold request submitted",
            requestId: request._id
        })
    }
)

//View My Requests (OPERATOR)
router.get(
    "/my",
    auth,
    async (req, res) => {

        if (req.role !== "OPERATOR") {
            return res.json({ message: "Operator access only" })
        }

        const requests = await Request.find({
            requestedBy: req.userId
        })

        return res.json(requests)
    }
)

//View Pending Requests (ADMIN)
router.get(
    "/pending",
    auth,
    async (req, res) => {

        if (req.role !== "ADMIN") {
            return res.json({ message: "Admin access only" })
        }

        const requests = await Request.find({
            status: "PENDING"
        }).populate("requestedBy", "email role")

        return res.json(requests)
    }
)

// Approve Request (ADMIN)
router.post(
    "/:id/approve",
    auth,
    async (req, res) => {

        if (req.role !== "ADMIN") {
            return res.json({ message: "Admin access only" })
        }

        const request = await Request.findById(req.params.id)

        if (!request) {
            return res.json({ message: "Request not found" })
        }

        if (request.status !== "PENDING") {
            return res.json({ message: "Request already processed" })
        }

        request.status = "APPROVED"
        request.reviewedBy = req.userId
        request.reviewedAt = new Date()

        await request.save()

        return res.json({ message: "Request approved" })
    }
)

//Reject Request (ADMIN)
router.post(
    "/:id/reject",
    auth,
    async (req, res) => {

        if (req.role !== "ADMIN") {
            return res.json({ message: "Admin access only" })
        }

        const request = await Request.findById(req.params.id)

        if (!request) {
            return res.json({ message: "Request not found" })
        }

        if (request.status !== "PENDING") {
            return res.json({ message: "Request already processed" })
        }

        request.status = "REJECTED"
        request.reviewedBy = req.userId
        request.reviewedAt = new Date()

        await request.save()

        return res.json({ message: "Request rejected" })
    }
)

module.exports = router
