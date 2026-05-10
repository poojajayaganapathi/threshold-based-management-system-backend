const mongoose = require("mongoose")

const monitoredValueSchema = new mongoose.Schema({
    parameterName: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("MonitoredValue", monitoredValueSchema)
