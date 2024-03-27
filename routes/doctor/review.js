const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchdoctor = require('../../middleware/fetchdoctor');
const router = express.Router();
const Doctor = mongoose.model('Doctor');

router.post('/viewreviews', fetchdoctor, async (req, res) => {

    const doctorId = req.user.id;

    try {
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const reviews = doctor.reviews;

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router