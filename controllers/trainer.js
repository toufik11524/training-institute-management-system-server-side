const User = require('../models/user');
const Course = require('../models/course');
const Batch = require('../models/batch');
const Topic = require('../models/topic');
const Task = require('../models/task');
const jwt = require('jsonwebtoken');
const HTTP_STATUS = require('../utils/httpStatus');
const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/commonResponse');
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const path = require('path');
const { promisify } = require('util');
const crypto = require('crypto');
const sendMail = require('../config/mail');
const ejs = require('ejs');
const ejsRenderFile = promisify(ejs.renderFile);

class TrainerController {

    // create Task
    async postTask (req, res, next) {
        try {      
            console.log('req.body', req.body);
            console.log('req.user', req.user);  
            const errors = validationResult(req);
            if (!req.file) {
                errors.errors.push({ param: 'taskImage', msg: 'Task Image is required. Only jpeg, jpg and png file is allowed!' });
            }
            if (!errors.isEmpty()) {
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const name = req.body.name;
            const batchId = req.body.batchId;
            const trainerId = req.user._id;

            const taskImage = 'images/'+req.file.filename;
            const task = new Task({name, batchId, trainerId, taskImage, taskMarks: []});
            await task.save();

            return res
                .status(HTTP_STATUS.OK)
                .send(success('Task is created successfully', task));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all task of a trainer
    async getTrainerAllTask (req, res, next) {
        try {
            const trainerId = req.params.trainerId;
            const tasks = await Task.find({trainerId: trainerId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All Tasks are fetched successfully of Trainer', tasks)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get a task
    async getTask (req, res, next) {
        try {
            const taskId = req.params.taskId;
            const task = await Task.findById(taskId).populate('taskMarks.trainee','name').exec();
            if (task) {
                return res.status(HTTP_STATUS.OK).send(success('Task Found', task));       
            }
            return res.status(HTTP_STATUS.NOT_FOUND).send(success('Task not Found'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // submit task marks
    async postSubmitMarks(req, res, next) {
        try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
            .send(failure("Invalid Inputs", errors.array()));
        }
        const traineeId = req.body.traineeId;
        const marks = req.body.marks;
        const taskId = req.params.taskId;
        const task = await Task.findOne({ _id: taskId }).exec();

        if (task) {
            await task.submitTaskMarks(traineeId, marks);
        } else {
            return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("Task is not Found"));
        }

        return res.status(HTTP_STATUS.OK).send(success("Marks Input done!"));

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all task of a batch
    async getBatchAllTask (req, res, next) {
        try {
            const batchId = req.params.batchId;
            const tasks = await Task.find({batchId: batchId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All Tasks are fetched successfully of a Batch', tasks)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}

module.exports = new TrainerController();