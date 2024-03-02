const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const fetchpatient = require('../../middleware/fetchpatient');
const router = express.Router();
const Doctor = mongoose.model('Doctor');


router.post('/makereview', fetchpatient, async (req, res) => {

    const { id, rating, review } = req.body;

    const patient_name= req.user.name;

    try {
        // Find the doctor by ID
        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Update reviews field
        doctor.reviews.push({ patient_name, rating, review });

        // Save the updated doctor information
        const updatedDoctor = await doctor.save();

        res.json({ message: 'Reviews updated successfully', doctor: updatedDoctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router