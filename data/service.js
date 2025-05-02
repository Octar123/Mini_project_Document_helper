const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    authority: String,
    service: Array,
},{strict: false})


module.exports = mongoose.model("service", serviceSchema);