const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    birthdate: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    licene_number: {
        type: String,
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    qualification: {
        type: String,
        required: true
    },

    med_school: {
        type: String,
        required: true
    },

    graduation_year: {
        type: String,
        required: true
    },

    gov_id: {
        type: String,
        required: true
    },

    med_license: {
        type: String,
        default: ""
    },

    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    Avatar: {
        type: String,
        default: ""
    }

})

doctorSchema.pre('save', function (next) {
    const doctor = this;
    if (!doctor.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err)
        }

        bcrypt.hash(doctor.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }
            doctor.password = hash;
            next()
        })
    })

})

doctorSchema.methods.comparePassword = function (candidatePassword) {
    const doctor = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, doctor.password, (err, isMatch) => {
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

mongoose.model('Doctor', doctorSchema)