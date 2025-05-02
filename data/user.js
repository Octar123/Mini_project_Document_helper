const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age: Number,
    gender: String,
    profession: String,
})

module.exports = mongoose.model("user", userSchema);