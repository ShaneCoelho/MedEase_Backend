const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const router = express.Router();
const Doctor = mongoose.model('Doctor');


router.post('/viewdoctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({}, 'id name practicing_at specialization city Avatar');

        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/viewdoctordetails', async (req, res) => {
    const { id } = req.body;

    try {
        // Find the doctor by ID in the MongoDB database
        const doctor = await Doctor.findById(id, {
            name: 1,
            phone: 1,
            address: 1,
            specialization: 1,
            experience: 1,
            qualification: 1,
            gender: 1,  
            Avatar: 1,
            reviews: 1,
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router