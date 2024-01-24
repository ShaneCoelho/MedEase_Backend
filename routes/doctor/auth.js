const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const router = express.Router();
const Doctor = mongoose.model('Doctor');


router.post('/docsignin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(422).send({ error: "Must provide username and password" });
    }

    try {
        const user = await Doctor.findOne({ username });
        if (!user) {
            return res.status(401).send({ error: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (err) {
        return res.status(500).send({ error: "Internal server error" });
    }
});


module.exports = router