const Course = require('../models/course');
const User = require('../models/user');
const Batch = require('../models/batch');
const Topic = require('../models/topic');
const { success, failure } = require('../utils/commonResponse');
const HTTP_STATUS = require('../utils/httpStatus');
const { validationResult } = require('express-validator');
const getPagination = require('../utils/pagination');

class HomeController {
    // get all courses
    async getAllCourse(req, res, next) {
        try {
            const page = req.query.page ? req.query.page : 1;
            const coursePerPage = req.query.coursePerPage ? req.query.coursePerPage : 4;
            const { skip, limit } = getPagination(page, coursePerPage);

            const courses = await Course.find().skip(skip).limit(limit).exec();
            const total = await Course.count().exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All courses are fetched successfully', {courses, total})
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all courses under a specifice batche
    async getBatchAllCourse (req, res, next) {
        try {
            // console.log("req", req);
            const batchId = req.params.batchId;
            const courses = await Course.find({batchId: batchId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All Courses are fetched successfully for the Batch', courses)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get a specifice course
    async getCourse(req, res, next) {
        try {
            const courseId = req.params.courseId;
            const course = await Course.findById(courseId).populate('topics.topic','name _id').exec();
            if (course) {
                const batch = await Batch.findById(course.batchId).exec();
                course.batchName = batch.name;
                course.save();
                return res.status(HTTP_STATUS.OK).send(success('Course Found', course));
            }
            return res.status(HTTP_STATUS.NOT_FOUND).send(failure('Course not Found'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get a specifice trainer
    async getTrainer(req, res, next) {
        try {
            const trainerId = req.params.trainerId;
            const trainer = await User.findById(trainerId).populate('topics.topic','name _id').exec();
            if (trainer) {
                return res.status(HTTP_STATUS.OK).send(success('Trainer Found', trainer));       
            }
            return res.status(HTTP_STATUS.OK).send(failure('Trainer not Found'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all trainers
    async getAllTrainers(req, res, next) {
        try {
            // console.log("req", req);
            const trainers = await User.find({role: "2"}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All Trainer are fetched successfully', trainers)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get a specifice trainee
    async getTrainee(req, res, next) {
        try {
            const traineeId = req.params.traineeId;
            const trainee = await User.findById(traineeId).exec();
            if (trainee) {
                return res.status(HTTP_STATUS.OK).send(success('Trainee Found', trainee));       
            }
            return res.status(HTTP_STATUS.OK).send(success('Trainee not Found'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all Trainees
    async getAllTrainees(req, res, next) {
        try {
            // console.log("req", req);
            const trainees = await User.find({role: "3"}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All Trainees are fetched successfully', trainees)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all batchs
    async getAllBatches(req, res, next) {
        try {
            // console.log("req", req);
            const batches = await Batch.find().exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All Batches are fetched successfully', batches)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get a specifice batch
    // async getBatch(req, res, next) {
    //     try {
    //         const batchId = req.params.batchId;
    //         const batch = await Batch.findById(batchId).exec();
    //         if (batch) {
    //             return res.status(HTTP_STATUS.OK).send(success('Batch Found', batch));       
    //         }
    //         return res.status(HTTP_STATUS.OK).send(success('Batch not Found'));
    //     } catch (error) {
    //         console.log(error);
    //         next(error);
    //     }
    // }
    // get a specifice batch
    async getBatch(req, res, next) {
        try {
            const batchId = req.params.batchId;
            // const batch = await Batch.findById(batchId).exec();
            const trainees = await Batch.findOne({_id: batchId}).populate('_id','name -_id').populate('trainees.trainee','name _id').exec();
            return res.status(HTTP_STATUS.OK).send(success('Trainees are fetched from Batch', trainees));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get all Topics
    async getTopics (req, res, next) {
        try {
            const topics = await Topic.find().exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success('All topics are fetched successfully', topics)
                );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // get a specific topic
    async getSingleTopics (req, res, next) {
        try {
            const topicId = req.params.topicId;
            const topic = await Topic.findById(topicId).exec();
            if (topic) {
                return res.status(HTTP_STATUS.OK).send(success('Topic Found', topic));       
            }
            return res.status(HTTP_STATUS.NOT_FOUND).send(success('Topic not Found'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}

module.exports = new HomeController();