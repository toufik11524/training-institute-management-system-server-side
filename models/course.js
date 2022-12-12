const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Batch',
    },
    batchName: {
        type: String,
        ref: 'Batch',
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    courseImage: {
        type: String,
        required: true
    },
    topics: [
        {
            topic: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'Topic'
            }
        }
    ]
});

CourseSchema.methods.addToCourse = async function (topicId) {
    try {
        this.topics.push({
            topic: topicId
        });
        await this.save();
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

CourseSchema.methods.removeFromCourse = async function (topicId) {
    try {
        this.topics = this.topics.filter(
            (tr) => tr.topic.toString() !== topicId.toString()
        );
        await this.save();
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;