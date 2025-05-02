const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/docHelper`);

const dataBase = mongoose.Schema({
    h2: String,
    l1: String,
    l2: String,
    l3: String,
    l4: String,
    image_link: String,
    name: String,
})

module.exports = mongoose.model("data", dataBase);