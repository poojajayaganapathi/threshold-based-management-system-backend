const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

// Auth middleware - verifies JWT token and attaches user info to request
module.exports = async (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).json({ message: "Authorization missing" })
    }
    try {
        const token = authorization.split(" ")[1]
        const decode = jwt.verify(token, process.env.SECRET_KEY)

        // Look up user to get role
        const user = await User.findById(decode.user).select("-password")
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }

        req.user = decode.user   // Keep backward compat
        req.userId = user._id
        req.role = user.role
        next()
    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: "Token is invalid or expired" })
    }
}