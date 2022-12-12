const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        require: true
    },
    endDate: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    trainees: [
        {
            trainee: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'User'
            }
        }
    ]
});

BatchSchema.methods.addToBatch = async function (traineeId) {
    try {
        this.trainees.push({
            trainee: traineeId
        });
        await this.save();
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

BatchSchema.methods.removeFromBatch = async function (traineeId) {
    try {
        this.trainees = this.trainees.filter(
            (tr) => tr.trainee.toString() !== traineeId.toString()
        );
        await this.save();
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const Batch = mongoose.model('Batch', BatchSchema);

module.exports = Batch;