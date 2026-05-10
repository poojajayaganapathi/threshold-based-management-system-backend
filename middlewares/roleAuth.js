// Role-based authorization middleware
// Usage: authorize("ADMIN") or authorize("OPERATOR")
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.role) {
            return res.status(401).json({ message: "Not authenticated" })
        }
        if (!roles.includes(req.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." })
        }
        next()
    }
}

module.exports = authorize
