const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Batch",
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    taskImage: {
        type: String,
        required: true,
    },
    taskMarks: [
        {
            trainee: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            marks: {
                type: String,
            }
        }
    ]
});

TaskSchema.methods.submitTaskMarks = async function (traineeId, marks) {
    try {
        this.taskMarks.push({
            trainee: traineeId,
            marks: marks,
        });
          await this.save();
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;