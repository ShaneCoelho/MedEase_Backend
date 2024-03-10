const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchpatient = require('../../middleware/fetchpatient');
const router = express.Router();
const Patient = mongoose.model('Patient');

router.post('/trackappointment', fetchpatient, async (req, res) => {

    const patientId = req.user.id;

    try {
  
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const { pending, approved, rejected } = patient;

        res.status(200).json({ pending, approved, rejected });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router