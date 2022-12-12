const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Course'
    }
});

const Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic;