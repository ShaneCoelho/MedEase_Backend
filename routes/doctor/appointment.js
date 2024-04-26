const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const fetchdoctor = require('../../middleware/fetchdoctor');
const router = express.Router();
const Doctor = mongoose.model('Doctor');
const Patient = mongoose.model('Patient');


router.post('/viewappointments', fetchdoctor, async (req, res) => {

    const doctorId = req.user._id;

    try {

        const doctor = await Doctor.findById(doctorId, 'pending');

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json(doctor.pending);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/approveappointment', fetchdoctor, async (req, res) => {

    const doctorId = req.user._id;

    //Accessing from frontend
    const appoint_id = req.body.appoint_id;
    const patient_id = req.body.patient_id;
    const patient_name = req.body.patient_name;
    const date = req.body.date;
    const time_slot = req.body.time_slot;
    const description = req.body.description;
    const document = req.body.document;
    const Patient_Avatar = req.body.Patient_Avatar;

    //Accessing using token
    const doc_name = req.user.name;
    const Doc_Avatar = req.user.Avatar;

    //Status
    const status = "Approve";

    const appointIdToDelete = Number(appoint_id);

    try {

        const doctor = await Doctor.findById(req.user.id);

        const patient = await Patient.findById(patient_id);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const newFile = {
            appoint_id: appoint_id,
            patient_name: patient_name,
            date: date,
            time_slot: time_slot,
            description: description,
            document: document,
            Patient_Avatar: Patient_Avatar
        };

        const newApproved = {
            appoint_id: appoint_id,
            doc_name: doc_name,
            date: date,
            time_slot: time_slot,
            status: status,
            Doc_Avatar: Doc_Avatar
        };

        doctor.approved.push(newFile);

        //Searching the appointment with appointment id
        const appointIndex = doctor.pending.findIndex(appointment => appointment.appoint_id === appointIdToDelete);

        if (appointIndex === -1) {
            return res.status(404).json({ error: 'Appointment not found in the doctor pending list' });
        }

        // Remove the appointment from the pending array
        doctor.pending.splice(appointIndex, 1);

        patient.approved.push(newApproved);

        //Searching the appointment with appointment id
        const appointPatientIndex = patient.pending.findIndex(appointment => appointment.appoint_id === appointIdToDelete);

        if (appointPatientIndex === -1) {
            return res.status(404).json({ error: 'Appointment not found in the patient pending list' });
        }

        // Remove the appointment from the pending array
        patient.pending.splice(appointPatientIndex, 1);

        await doctor.save();

        await patient.save();
        res.status(200).json({ message: 'Appointment approved successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});

router.post('/rejectappointment', fetchdoctor, async (req, res) => {


    //Accessing from frontend
    const appoint_id = req.body.appoint_id;
    const patient_id = req.body.patient_id;
    const date = req.body.date;

    //Accessing using token
    const doc_name = req.user.name;
    const Doc_Avatar = req.user.Avatar;

    //Status
    const status = "Rejected";

    const appointIdToDelete = Number(appoint_id);

    try {

        const doctor = await Doctor.findById(req.user.id);

        const patient = await Patient.findById(patient_id);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }


        const newRejected = {
            appoint_id: appoint_id,
            doc_name: doc_name,
            date: date,
            status: status,
            Doc_Avatar: Doc_Avatar
        };


        //Searching the appointment with appointment id
        const appointIndex = doctor.pending.findIndex(appointment => appointment.appoint_id === appointIdToDelete);

        if (appointIndex === -1) {
            return res.status(404).json({ error: 'Appointment not found in the doctor pending list' });
        }

        // Remove the appointment from the pending array
        doctor.pending.splice(appointIndex, 1);

        patient.rejected.push(newRejected);

        //Searching the appointment with appointment id
        const appointPatientIndex = patient.pending.findIndex(appointment => appointment.appoint_id === appointIdToDelete);

        if (appointPatientIndex === -1) {
            return res.status(404).json({ error: 'Appointment not found in the patient pending list' });
        }

        // Remove the appointment from the pending array
        patient.pending.splice(appointPatientIndex, 1);

        await doctor.save();

        await patient.save();
        res.status(200).json({ message: 'Appointment Rejected successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/viewapprovedappointments', fetchdoctor, async (req, res) => {

    const doctorId = req.user._id;

    try {
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Filter appointments for today or later
        const today = new Date();
        const filteredAppointments = doctor.approved.filter(appointment => {
            const [day, month, year] = appointment.date.split('/');
            const appointmentDate = new Date(`${year}-${month}-${day}`); // Reformatting the date string to YYYY-MM-DD
            // Set hours, minutes, seconds, and milliseconds of today's date to 0 for accurate comparison
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return appointmentDate >= todayStart;
        });

        const approvedAppointments = filteredAppointments.map(appointment => {
            return {
                patient_name: appointment.patient_name,
                date: appointment.date,
                time_slot: appointment.time_slot,
                appoint_id: appointment.appoint_id
            };
        });

        res.json(approvedAppointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/viewtodaysappointments', fetchdoctor, async (req, res) => {

    const doctorId = req.user._id;

    try {
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Filter appointments for today
        const today = new Date();
        const filteredAppointments = doctor.approved.filter(appointment => {
            const [day, month, year] = appointment.date.split('/'); // Splitting the date string
            const appointmentDate = new Date(`${year}-${month}-${day}`); // Reformatting the date string to YYYY-MM-DD
            return appointmentDate.toDateString() === today.toDateString();
        });

        const approvedAppointments = filteredAppointments.map(appointment => {
            return {
                patient_name: appointment.patient_name,
                date: appointment.date,
                time_slot: appointment.time_slot,
                appoint_id: appointment.appoint_id,
                description: appointment.description,
                document: appointment.document,
                Patient_Avatar: appointment.Patient_Avatar
            };
        });

        res.json(approvedAppointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/viewpastappointments', fetchdoctor, async (req, res) => {

    const doctorId = req.user._id;

    try {
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Filter appointments for today or later
        const today = new Date();
        const filteredAppointments = doctor.approved.filter(appointment => {
            const [day, month, year] = appointment.date.split('/');
            const appointmentDate = new Date(`${year}-${month}-${day}`); // Reformatting the date string to YYYY-MM-DD
            // Set hours, minutes, seconds, and milliseconds of today's date to 0 for accurate comparison
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return appointmentDate <= todayStart;
        });

        const approvedAppointments = filteredAppointments.map(appointment => {
            return {
                patient_name: appointment.patient_name,
                date: appointment.date,
                time_slot: appointment.time_slot,
                appoint_id: appointment.appoint_id
            };
        });

        res.json(approvedAppointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/cancelappointment', fetchdoctor, async (req, res) => {

    const doctorId = req.user._id;
    const appointId = req.body.appoint_id;
    console.log(appointId)

    try {
        // Find the doctor by id
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const appointIndex = doctor.approved.findIndex(appointment => appointment.appoint_id === appointId);

        if (appointIndex === -1) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        doctor.approved.splice(appointIndex, 1);

        await doctor.save();

        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router