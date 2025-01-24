const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    description: String,
    location: {lat: Number, lng: Number, address: String},
    vote: { type: mongoose.Schema.ObjectId, ref: 'Vote' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);