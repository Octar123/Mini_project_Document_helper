const mongoose = require('mongoose');

const imageSchema = {
    service_name: String,
    document: String,
    heading: String,
    info1: String,
    info2: String,
    info3: String,
    info4: String,
    image_data: {
        type: String, required: true
    }
}

module.exports = mongoose.model("Image", imageSchema)