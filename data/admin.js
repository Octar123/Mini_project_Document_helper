const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    email: String,
    password: String
})

module.exports = mongoose.model("admin", adminSchema);