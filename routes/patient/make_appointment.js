const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchpatient = require('../../middleware/fetchpatient');
const router = express.Router();
const admin = require("firebase-admin");
const multer = require("multer");
const serviceAccount = require("../../serviceAccountKey.json");
const Doctor = mongoose.model('Doctor');
const Patient = mongoose.model('Patient');


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


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "medease-9368b.appspot.com",
});

const bucket = admin.storage().bucket();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/makeappointment", fetchpatient, upload.single("file"), async (req, res) => {

  console.log("reached");

  const jsonData = JSON.parse(req.body.data);

  console.log(jsonData.id);

  // Accessing from frontend
  const doc_id = jsonData.id;
  const doc_name = jsonData.name;
  const preferred_time = jsonData.preferred_time;
  const description = jsonData.description;
  const date = new Date(jsonData.date).toLocaleDateString('en-GB');
  const Doc_Avatar = jsonData.Avatar;

  // Accessing using token
  const patient_id = req.user._id;
  const patient_name = req.user.name;
  const mobno = req.user.mobno;
  const Patient_Avatar = req.user.Avatar;
  const gender = req.user.gender;
  const birthdate = req.user.birthdate;
  const bloodgroup = req.user.bloodgroup;
  const weight = req.user.weight;

  // Appointment Id
  const appoint_id = generateRandomNumber();

  const file = req.file;

  const document = file ? `https://storage.googleapis.com/${bucket.name}/${file.originalname}` : ''; // If file uploaded, set document URL, otherwise empty string

  if (!file) {
    console.log("No file uploaded.");
  }

  const fileRef = file ? bucket.file(file.originalname) : null;
  const blobStream = fileRef ? fileRef.createWriteStream() : null;

  if (blobStream) {
    blobStream.on("error", (error) => {
      res.status(500).send("File upload error: " + error);
    });

    blobStream.on("finish", () => {
      fileRef.makePublic().then(async () => {
        try {
          const doctor = await Doctor.findById(doc_id);
          const patient = await Patient.findById(req.user.id);

          if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
          }

          if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
          }

          const newFile = {
            appoint_id: appoint_id,
            patient_id: patient_id,
            patient_name: patient_name,
            date: date,
            preferred_time: preferred_time,
            description: description,
            document: document,
            mobno: mobno,
            gender: gender,
            birthdate: birthdate,
            bloodgroup: bloodgroup,
            weight: weight,
            Patient_Avatar: Patient_Avatar
          };

          const newPending = {
            appoint_id: appoint_id,
            doc_name: doc_name,
            date: date,
            Doc_Avatar: Doc_Avatar
          };

          doctor.pending.push(newFile);
          patient.pending.push(newPending);

          await doctor.save();
          await patient.save();
          res.status(200).json({ message: 'Appointment made successfully' });
        } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal Server Error");
        }
      });
    });

    blobStream.end(file.buffer);
  } else {
    try {
      const doctor = await Doctor.findById(doc_id);
      const patient = await Patient.findById(req.user.id);

      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const newFile = {
        appoint_id: appoint_id,
        patient_id: patient_id,
        patient_name: patient_name,
        date: date,
        preferred_time: preferred_time,
        description: description,
        document: document,
        mobno: mobno,
        gender: gender,
        birthdate: birthdate,
        bloodgroup: bloodgroup,
        weight: weight,
        Patient_Avatar: Patient_Avatar
      };

      const newPending = {
        appoint_id: appoint_id,
        doc_name: doc_name,
        date: date,
        Doc_Avatar: Doc_Avatar
      };

      doctor.pending.push(newFile);
      patient.pending.push(newPending);

      await doctor.save();
      await patient.save();
      res.status(200).json({ message: 'Appointment made successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
});



module.exports = router