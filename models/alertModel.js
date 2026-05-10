const mongoose = require("mongoose")

const alertSchema = new mongoose.Schema({
    parameterName: {
        type: String,
        required: true
    },
    submittedValue: {
        type: Number,
        required: true
    },
    thresholdMin: {
        type: Number,
        required: true
    },
    thresholdMax: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["NORMAL", "LOW_ALERT", "HIGH_ALERT"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    monitoredValueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MonitoredValue",
        required: true
    },
    thresholdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threshold",
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Alert", alertSchema)
