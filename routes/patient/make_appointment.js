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


module.exports = router