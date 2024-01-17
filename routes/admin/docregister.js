const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchadmin = require('../../middleware/fetchadmin');
const router = express.Router();
const Admin = mongoose.model('Admin');
const Doctor = mongoose.model('Doctor');


router.post('/adddoctor', fetchadmin, async (req, res) => {
    try {
        const { name, gender, dob, email, phone, address, licene_number, specialization, experience, qualification, med_school, graduation_year, gov_id, med_license, username, password, Avatar } = req.body;

        const existingUser = await Doctor.findOne({ username });
        if (existingUser) {
            return res.status(409).send({ message: 'Username Already Taken' });
        }

        const newDoctor = new Doctor({ name, gender, dob, email, phone, address, licene_number, specialization, experience, qualification, med_school, graduation_year, gov_id, med_license, username, password, Avatar });
        await newDoctor.save();

        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

})


module.exports = router