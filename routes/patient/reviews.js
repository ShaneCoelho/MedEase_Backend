const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const fetchpatient = require('../../middleware/fetchpatient');
const router = express.Router();
const Doctor = mongoose.model('Doctor');

const generatedNumbers = [];

function generateRandomNumber() {
  const min = 1000;
  const max = 9999;
  let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Check if the number is already generated
  while (generatedNumbers.includes(randomNumber)) {
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Add the number to the generatedNumbers array
  generatedNumbers.push(randomNumber);

  return randomNumber;
}

router.post('/makereview', fetchpatient, async (req, res) => {

    const review_id = generateRandomNumber();

    const { doc_id, rating, review } = req.body;

    const patient_name= req.user.name;
    const patient_Avatar= req.user.Avatar;

    try {
        // Find the doctor by ID
        const doctor = await Doctor.findById(doc_id);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Update reviews field
        doctor.reviews.push({ review_id, patient_name, rating, review, patient_Avatar });

        // Save the updated doctor information
        const updatedDoctor = await doctor.save();

        res.json({ message: 'Reviews updated successfully', doctor: updatedDoctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/viewdoctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'id name practicing_at specialization city Avatar');

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router