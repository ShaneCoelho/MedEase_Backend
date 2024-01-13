const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const patientSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    name: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        default: ""
    },

    birthdate: {
        type: String,
        default: ""
    },

    bloodgroup: {
        type: String,
        default: ""
    },

    weight: {
        type: String,
        default: ""
    },

    mobno: {
        type: String,
        default: ""
    },

    Avatar: {
        type: String,
        default: ""
    }

})

patientSchema.pre('save', function (next) {
    const patient = this;
    if (!patient.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err)
        }

        bcrypt.hash(patient.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }
            patient.password = hash;
            next()
        })
    })

})

patientSchema.methods.comparePassword = function (candidatePassword) {
    const patient = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, patient.password, (err, isMatch) => {
            if (err) {
                return reject(err)
            }
            if (!isMatch) {
                return reject(err)
            }
            resolve(true)
        })
    })
}

mongoose.model('Patient', patientSchema)