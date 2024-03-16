const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const router = express.Router();
const Doctor = mongoose.model('Doctor');

router.post('/addlocation', async (req, res) => {

    const { id, location: { latitude, longitude } } = req.body;

    try {
        const doctor = await Doctor.findByIdAndUpdate(id, {
            location: {
                type: "Point",
                coordinates: [longitude, latitude], // Reverse order for MongoDB
            },
            // ... other doctor fields to update
        }, { new: true }); // Return the updated document

        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error updating doctor' });
    }
});


module.exports = router