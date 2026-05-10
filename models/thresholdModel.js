const mongoose = require("mongoose")

const thresholdSchema = new mongoose.Schema({
    parameterName: {
        type: String,
        required: true
    },
    minValue: {
        type: Number,
        required: true
    },
    maxValue: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Threshold", thresholdSchema)
