require("dotenv").config()
const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const router = express.Router()

// POST /api/auth/register - User registration
router.post("/register",
    async (req, res) => {
        try {
            const firstname = req.body.firstname
            const lastname = req.body.lastname
            const username = req.body.username
            const password = req.body.password
            const email = req.body.email
            const bio = req.body.bio
            const role = req.body.role || "OPERATOR"

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" })
            }
            if (password.length <= 6) {
                return res.status(400).json({ message: "Password should be minimum 7 characters" })
            }

            const userCheck = await User.findOne({ email: email })
            if (userCheck) {
                return res.status(400).json({ message: "User already exists" })
            }
            const hashedPassword = await bcrypt.hash(password, 10)

            const user = new User({
                firstname: firstname,
                lastname: lastname,
                username: username,
                email: email,
                password: hashedPassword,
                bio: bio,
                role: role
            })

            await user.save()
            res.status(201).json({ message: "Registration successful" })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "Server error" })
        }
    }
)

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(400).json({ message: "Email is invalid" })
        }
        const isPasswordMatching = await bcrypt.compare(req.body.password, user.password)
        if (!isPasswordMatching) {
            return res.status(400).json({ message: "Password is invalid" })
        }
        const token = jwt.sign(
            { user: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        )
        return res.json({
            message: "Login Successful",
            token: token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router