const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const fetchpatient = require('../../middleware/fetchpatient');
const router = express.Router();
const Doctor = mongoose.model('Doctor');

router.post('/findnearestdoctor', async (req, res) => {

    const { lat, lng, specialization } = req.body;

    if (!lat || !lng || !specialization) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    const location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)], // Convert string coordinates to numbers
    };

    const query = { specialization };

    try {
        const doctors = await Doctor.find({
            location: {
                $geoWithin: {
                    $centerSphere: [location.coordinates, 0.01], // Search radius in radians (adjust for kilometers)
                },
            },
            ...query, // Include specialization filter
        });

        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error finding doctors' });
    }
});


module.exports = router