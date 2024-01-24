const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchpatient = require('../../middleware/fetchpatient');
const router = express.Router();
const multer = require('multer');
const Patient = mongoose.model('Patient');
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


router.post('/adddetails', fetchpatient, uploads.single('profile'), async (req, res) => {

    if (!req.user)
        return res
            .status(401)
            .json({ success: false, message: 'unauthorized access!' });

    try {

        const jsonData = JSON.parse(req.body.data);
        const { name, gender, birthdate, bloodgroup, weight, mobno} = jsonData;

        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${req.user._id}_profile`,
            width: 500,
            height: 500,
            crop: 'fill',
        });

        const Avatar=result.url;

        console.log(req.user._id)

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.user._id, 
            {name:name, 
            gender:gender, 
            birthdate:birthdate, 
            bloodgroup:bloodgroup, 
            weight:weight, 
            mobno:mobno, 
            Avatar:Avatar}, 
            { new: true });
      
          if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
          }
      
          res.status(200).json(updatedPatient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

})


module.exports = router