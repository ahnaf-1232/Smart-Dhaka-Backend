const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
    description: String,
    vote: { type: mongoose.Schema.ObjectId, ref: 'Vote' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Idea', IdeaSchema);