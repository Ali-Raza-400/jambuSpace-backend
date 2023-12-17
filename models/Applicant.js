// models/Applicant.js

const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cv: {
    filename: {
      type: String,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jobs',
    required: true,
  },
  phoneNumber: {
    type: String, // Adjust the type as needed
    required: true,
  },
  experience: {
    type: String, // Adjust the type as needed
    required: true,
  },
  experience: {
    type: String, // Adjust the type as needed
    required: true,
  },
  education: {
    type: String, // Adjust the type as needed
    required: true,
  },
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
