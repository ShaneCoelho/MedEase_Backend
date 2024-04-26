const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchadmin = require('../../middleware/fetchadmin');
const router = express.Router();
const multer = require('multer');
const Admin = mongoose.model('Admin');
const Doctor = mongoose.model('Doctor');
const cloudinary = require('../../helper/imageUpload')

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('invalid image file!', false);
  }
};
const uploads = multer({ storage, fileFilter });


router.post('/adddoctor', fetchadmin, uploads.single('profile'), async (req, res) => {

    if (!req.user)
        return res
            .status(401)
            .json({ success: false, message: 'unauthorized access!' });

    try {

        const jsonData = JSON.parse(req.body.data);
        const { name, gender, birthdate, email, phone, address, city, specialization, experience, qualification, med_school, graduation_year, practicing_at, med_license, username, password, google_location, location: { latitude, longitude }} = jsonData;

        const existingUser = await Doctor.findOne({ username });
        if (existingUser) {
            return res.status(409).send({ message: 'Username Already Taken' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${req.user._id}_profile`,
            width: 500,
            height: 500,
            crop: 'fill',
        });

        const Avatar=result.url;

        const newDoctor = new Doctor({ 
          name, 
          gender, 
          birthdate, 
          email, 
          phone, 
          address, 
          city, 
          specialization, 
          experience, 
          qualification, 
          med_school, 
          graduation_year, 
          practicing_at, 
          med_license, 
          username, 
          password,
          google_location,
          Avatar,
          location: {
            type: "Point",
            coordinates: [longitude, latitude], // Reverse order for MongoDB
          },  
        });
        await newDoctor.save();

        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

})


module.exports = router