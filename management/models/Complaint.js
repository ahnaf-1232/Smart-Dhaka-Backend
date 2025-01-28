const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    description: String,
    title: String,
    location: {lat: Number, lng: Number, address: String, thana: String},
    vote: { type: mongoose.Schema.ObjectId, ref: 'Vote' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Resolved', 'Closed'] },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);