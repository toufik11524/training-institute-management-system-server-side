const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Batch'
    },
    // topicId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: false,
    //     ref: 'Topic'
    // },
    role: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    topics: [
       {
            topic: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'Topic'
            }
       }
    ],
    traineeImage: String,
    trainerImage: String,
    isVerify: Boolean,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyToken: String,
    verifyExpire: Date
});

UserSchema.methods.addToTrainer = async function (topicId) {
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

UserSchema.methods.removeFromTrainer = async function (topicId) {
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

const User = mongoose.model('User', UserSchema);

module.exports = User;