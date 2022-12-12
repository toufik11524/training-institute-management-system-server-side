const User = require('../models/user');
const Course = require('../models/course');
const Batch = require('../models/batch');
const Topic = require('../models/topic');
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

class AdminController {
    // create trainer
    async postTrainer(req, res, next) {
        try {
            const errors = validationResult(req);

            if (!req.file) {
                errors.errors.push({ param: 'trainerImage', msg: 'Trainer Image is required. Only jpeg, jpg and png file is allowed!' });
            }
            if (!errors.isEmpty()) {
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const topicId = req.body.topicId;
            const role = '2';
            const name = req.body.name;
            const email = req.body.email;
            const password = await bcrypt.hash(req.body.password, 10);
            const trainerImage = 'images/'+req.file.filename;
            const isVerify = false;
            const trainer = new User({role, name, email, password, trainerImage, isVerify});
            trainer.topics.push({
                topic: topicId
            });
            await trainer.save();

            const trainerData = {
                _id: trainer._id,
                topicId: trainer.topicId,
                role: trainer.role,
                name: trainer.name,
                email: trainer.email,
                trainerImage: trainer.trainerImage,
                isVerify: trainer.isVerify
            };

            const jwtToken = jwt.sign(trainerData, process.env.JWT_SECRET_KEY, {expiresIn: '24h'});
            const resData = {
                access_token: jwtToken,
                ...trainerData
            }

            // implement verify email here
            const token = crypto.randomBytes(32).toString('hex');
            trainer.verifyToken = token;
            trainer.verifyExpire = Date.now() + 60 * 60 * 1000;
            await trainer.save();

            const verifyUrl = path.join(
                process.env.BACKEND_URI,
                'verify-email',
                token,
                trainerData._id.toString()
            );
            // console.log(verifyUrl);

            const htmlStr = await ejsRenderFile(
                path.join(__dirname, '..', 'mails', 'verifyUser.ejs'),
                { name: trainerData.name, verifyUrl: verifyUrl }
            );

            sendMail({
                from: "Trainer Management <trainer@management.com>",
                to: trainerData.email,
                subject: "Verify User",
                html: htmlStr
            });
            
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Trainer is created successfully', trainer));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // update trainer
    async putEditTrainer(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // delete the uploaded image if any validation error occurs
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const trainerId = req.params.trainerId;
            const updatedTrainer = await User.findById(trainerId).exec();

            if (updatedTrainer) {
                updatedTrainer.name = req.body.name? req.body.name: updatedTrainer.name;
                updatedTrainer.email = req.body.email? req.body.email: updatedTrainer.email;
                updatedTrainer.password = req.body.password? req.body.password: updatedTrainer.password;

                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', updatedTrainer.trainerImage));
                    updatedTrainer.trainerImage = 'images/' + req.file.filename;
                }

                await updatedTrainer.save();
                return res
                    .status(HTTP_STATUS.OK)
                    .send(
                        success('Trainer Profile updated successfully', updatedTrainer)
                );
            }
            return res.status(HTTP_STATUS.NOT_FOUND)
                    .send(
                        failure('Trainer Profile is not found to update')
                    );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete trainer
    async deleteTrainer(req, res, next) {
        try {
            const trainerId = req.params.trainerId;
            //alternative way
            // await Product.findByIdAndRemove(prodId);
            await User.findOneAndDelete({_id: trainerId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Trainer is deleted successfully'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // --------------------------------------------------------------------------
    // create trainee
    async postTrainee(req, res, next) {
        try {
            // console.log('req.body', req.body);
            const errors = validationResult(req);

            if (!req.file) {
                errors.errors.push({ param: 'traineeImage', msg: 'Trainee Image is required. Only jpeg, jpg and png file is allowed!' });
            }
            if (!errors.isEmpty()) {
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const role = '3';
            const name = req.body.name;
            const email = req.body.email;
            const password = await bcrypt.hash(req.body.password, 10);
            const traineeImage = 'images/'+req.file.filename;
            const isVerify = false;

            const trainee = new User({role, name, email, password, traineeImage, isVerify});
            await trainee.save();

            const traineeData = {
                _id: trainee._id,
                role: trainee.role,
                name: trainee.name,
                email: trainee.email,
                traineeImage: trainee.traineeImage,
                isVerify: trainee.isVerify
            };

            const jwtToken = jwt.sign(traineeData, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
            const resData = {
                access_token: jwtToken,
                ...traineeData
            }

            // implement verify email here
            const token = crypto.randomBytes(32).toString('hex');
            trainee.verifyToken = token;
            trainee.verifyExpire = Date.now() + 60 * 60 * 1000;
            await trainee.save();

            const verifyUrl = path.join(
                process.env.BACKEND_URI,
                'verify-email',
                token,
                traineeData._id.toString()
            );
            // console.log(verifyUrl);

            const htmlStr = await ejsRenderFile(
                path.join(__dirname, '..', 'mails', 'verifyUser.ejs'),
                { name: traineeData.name, verifyUrl: verifyUrl }
            );

            sendMail({
                from: "Trainer Management <trainer@management.com>",
                to: traineeData.email,
                subject: "Verify User",
                html: htmlStr
            });
            
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Trainee is created successfully', trainee));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // update trainee
    async putTrainee(req, res, next) {
        try {
            // console.log('req.body', req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // delete the uploaded image if any validation error occurs
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const traineeId = req.params.traineeId;
            const updatedTrainee = await User.findById(traineeId).exec();
            if (updatedTrainee) {
                updatedTrainee.role = req.body.role? req.body.role: updatedTrainee.role;
                updatedTrainee.name = req.body.name? req.body.name: updatedTrainee.name;
                updatedTrainee.email = req.body.email? req.body.email: updatedTrainee.email;
                updatedTrainee.password = req.body.password? req.body.password: updatedTrainee.password;

                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', updatedTrainee.traineeImage));
                    updatedTrainee.traineeImage = 'images/' + req.file.filename;
                }

                await updatedTrainee.save();
                return res
                    .status(HTTP_STATUS.OK)
                    .send(
                        success('Trainee Profile is updated successfully', updatedTrainee)
                );
            }
            return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(
                        failure('Trainee Profile is not found to update')
                    );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete trainee
    async deleteTrainee(req, res, next) {
        try {
            const traineeId = req.params.traineeId;
            //alternative way
            // await Product.findByIdAndRemove(prodId);
            // const trainee = await User.findById(traineeId).exec();
            // if (trainee.batchId) {

            // }

            await User.findOneAndDelete({_id: traineeId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Trainee is deleted successfully'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // --------------------------------------------------------------------------
    // create course
    async postCourse(req, res, next) {
        try {        
            const errors = validationResult(req);
            if (!req.file) {
                errors.errors.push({ param: 'courseImage', msg: 'Course Image is required. Only jpeg, jpg and png file is allowed!' });
            }
            if (!errors.isEmpty()) {
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const batchId = req.body.batchId;
            const name = req.body.name;
            const category = req.body.category;
            const detail = req.body.detail;

            const courseImage = 'images/'+req.file.filename;
            const course = new Course({batchId, name, category, detail, courseImage});
            await course.save();

            return res
                .status(HTTP_STATUS.OK)
                .send(success('Course is created successfully', course));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // update course
    async putCourse(req, res, next) {
        try {
            // console.log('req.body', req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // delete the uploaded image if any validation error occurs
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'images', req.file.filename));
                }
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const courseId = req.params.courseId;
            const updatedCourse = await Course.findById(courseId).exec();
            if (updatedCourse) {
                updatedCourse.name = req.body.name? req.body.name: updatedCourse.name;
                updatedCourse.category = req.body.category? req.body.category: updatedCourse.category;
                updatedCourse.detail = req.body.detail? req.body.detail: updatedCourse.detail;
                // updatedCourse.courseImage = req.file ? 'images/' + req.file.filename : updatedCourse.courseImage;
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', updatedCourse.courseImage));
                    updatedCourse.courseImage = 'images/' + req.file.filename;
                }
                await updatedCourse.save();
                return res
                    .status(HTTP_STATUS.OK)
                    .send(
                        success('Course is updated successfully', updatedCourse)
                );
            }
            return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(
                        failure('Course is not found to update')
                    );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete course
    async deleteCourse(req, res, next) {
        try {
            const courseId = req.params.courseId;
            const course = await Course.findById(courseId).exec();
            if (course.topics.length > 0) {
                return res.status(HTTP_STATUS.FORBIDDEN).send(failure('Course has topic , first delete the topics'));
            }
            await Course.findOneAndDelete({_id: courseId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Course is deleted successfully'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // --------------------------------------------------------------------------
    // create batch
    async postBatch(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
                console.log("errors");
            }

            const name = req.body.name;
            const duration = req.body.duration;
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;
            const status = req.body.status;

            const batch = new Batch({name, duration, startDate, endDate, status, trainees: []});
            await batch.save();
            
            return res
                .status(HTTP_STATUS.OK)
                .send(success('New batch is created successfully', batch));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // update batch
    async putBatch(req, res, next) {
        try {
            // console.log('req.body', req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const batchId = req.params.batchId;
            const updatedBatch = await Batch.findById(batchId).exec();

            if (updatedBatch) {
                updatedBatch.name = req.body.name ? req.body.name : updatedBatch.name;
                updatedBatch.duration = req.body.duration? req.body.duration: updatedBatch.duration;
                updatedBatch.startDate = req.body.startDate? req.body.startDate: updatedBatch.startDate;
                updatedBatch.endDate = req.body.endDate? req.body.endDate: updatedBatch.endDate;
                updatedBatch.status = req.body.status? req.body.status: updatedBatch.status;
                updatedBatch.trainees = req.body.trainees? req.body.trainees: updatedBatch.trainees;

                await updatedBatch.save();
                return res
                    .status(HTTP_STATUS.OK)
                    .send(
                        success('Batch updated successfully', updatedBatch)
                );
            }
            return res.status(HTTP_STATUS.NOT_FOUND)
                    .send(
                        failure('Batch is not found to update')
                    );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete batch
    async deleteBatch(req, res, next) {
        try {
            const batchId = req.params.batchId;
            await Batch.findOneAndDelete({_id: batchId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Batch is deleted successfully'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // --------------------------------------------------------------------------
    // create topic
    async postTopic(req, res, next) {
        try {
            // console.log('req.body', req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const name = req.body.name;
            const duration = req.body.duration;

            const topic = new Topic({name, duration});
            await topic.save();
            
            return res
                .status(HTTP_STATUS.OK)
                .send(success('New Topic is created successfully', topic));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // update topic
    async putTopic(req, res, next) {
        try {
            // console.log('req.body', req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const topicId = req.params.topicId;
            const updatedTopic = await Topic.findById(topicId).exec();

            if (updatedTopic) {
                updatedTopic.name = req.body.name ? req.body.name : updatedTopic.name;
                updatedTopic.duration = req.body.duration? req.body.duration: updatedTopic.duration;

                await updatedTopic.save();
                return res
                    .status(HTTP_STATUS.OK)
                    .send(
                        success('Topic updated successfully', updatedTopic)
                );
            }
            return res.status(HTTP_STATUS.NOT_FOUND)
                    .send(
                        failure('Topic is not found to update')
                    );
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete topic
    async deleteTopic(req, res, next) {
        try {
            const topicId = req.params.topicId;
            await Topic.findOneAndDelete({_id: topicId}).exec();
            return res
                .status(HTTP_STATUS.OK)
                .send(success('Topic is deleted successfully'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // post trainee to batch
    async addToBatch (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const traineeId = req.body.traineeId;
            const batchId = req.params.batchId;
            const batch = await Batch.findOne({_id: batchId}).exec();
            // check if any batch exists.
            if (batch) {
                const trainee = await User.findById(traineeId).exec();
                if (trainee.batchId) {
                    if (trainee.batchId == batchId) {
                        return res.status(HTTP_STATUS.ALREADY_REPORTED).send(failure('Trainee is include in the batch'));
                    }
                    else {
                        return res.status(HTTP_STATUS.ALREADY_REPORTED).send(failure('Trainee is already include in another batch'));
                    }
                }
                else {
                    trainee.batchId = batchId;
                    await trainee.save();
                    //if exists, then add the trainee to that batch
                    await batch.addToBatch(traineeId);
                }
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure('Batch is not Found'));
            }
            return res.status(HTTP_STATUS.OK).send(success('Trainee is added to batch'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete trainee from batch
    async deleteFromBatch (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const batchId = req.params.batchId;
            const traineeId = req.body.traineeId;
            const batch = await Batch.findOne({ _id: batchId }).exec();
            if (batch) {
                const filter = { _id: traineeId };
                const update = { $unset: { batchId: "" } };

                let doc = await User.findOneAndUpdate(filter, update, {
                    new: true
                });
                // const trainee = await User.findById(traineeId).exec();
                
                // trainee.batchId = undefined;
                // await trainee.save();
                // training.users.updateOne(
                //     { _id: req.body.traineeId },
                //     { $unset: { batchId: "" } }
                //  )
                await batch.removeFromBatch(traineeId);
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Batch doesn't exist!!"));
            }
            return res.status(HTTP_STATUS.OK).send(success('Trainee is removed from Batch'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // post topics to course
    async addToCourse (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const topicId = req.body.topicId;
            const courseId = req.params.courseId;
            // console.log('courseId', courseId);
            // console.log('topicId', topicId);
            const course = await Course.findOne({_id: courseId}).exec();
            // check if any course exists.
            if (course) {
                const topic = await Topic.findById(topicId).exec();
                if (topic.courseId) {
                    if (topic.courseId == courseId) {
                        return res.status(HTTP_STATUS.ALREADY_REPORTED).send(failure('Topic is include in the course'));
                    }
                    else {
                        return res.status(HTTP_STATUS.ALREADY_REPORTED).send(failure('Topic is already include in another course'));
                    }
                }
                else {
                    topic.courseId = courseId;
                    await topic.save();
                    //if exists, then add the topic to that course
                    await course.addToCourse(topicId);
                }
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure('Course is not Found'));
            }
            return res.status(HTTP_STATUS.OK).send(success('Topic is added to course'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // delete topics from course
    async deleteFromCourse (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const courseId = req.params.courseId;
            const topicId = req.body.topicId;
            const course = await Course.findOne({ _id: courseId }).exec();
            if (course) {
                const filter = { _id: topicId };
                const update = { $unset: { courseId: "" } };

                let doc = await Topic.findOneAndUpdate(filter, update, {
                    new: true
                });
                // const trainee = await User.findById(traineeId).exec();
                
                // trainee.batchId = undefined;
                // await trainee.save();
                // training.users.updateOne(
                //     { _id: req.body.traineeId },
                //     { $unset: { batchId: "" } }
                //  )
                await course.removeFromCourse(topicId);
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Course doesn't exist!!"));
            }
            return res.status(HTTP_STATUS.OK).send(success('Topic is removed from Course'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // add topic to trainer
    async addToTrainer (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const topicId = req.body.topicId;
            const trainerId = req.params.trainerId;
            // console.log('courseId', courseId);
            // console.log('topicId', topicId);
            const trainer = await User.findOne({_id: trainerId}).exec();
            // check if any trainer exists.
            if (trainer) {
                const topic = await Topic.findById(topicId).exec();
                if (topic.trainerId) {
                    if (topic.trainerId == trainerId) {
                        return res.status(HTTP_STATUS.ALREADY_REPORTED).send(failure('Topic is include in the trainer'));
                    }
                    else {
                        return res.status(HTTP_STATUS.ALREADY_REPORTED).send(failure('Topic is already include in another trainer'));
                    }
                }
                else {
                    topic.trainerId = trainerId;
                    await topic.save();
                    //if exists, then add the topic to that course
                    await trainer.addToTrainer(topicId);
                }
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure('Trainer is not Found'));
            }
            return res.status(HTTP_STATUS.OK).send(success('Topic is added to Trainer'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // remove topic from trainer
    async removeToTrainer (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }
            const trainerId = req.params.trainerId;
            const topicId = req.body.topicId;
            const trainer = await User.findOne({ _id: trainerId }).exec();
            if (trainer) {
                const filter = { _id: topicId };
                const update = { $unset: { trainerId: "" } };

                let doc = await Topic.findOneAndUpdate(filter, update, {
                    new: true
                });
                // console.log(trainer.topics.length);
                await trainer.removeFromTrainer(topicId);
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Trainer doesn't exist!!"));
            }
            return res.status(HTTP_STATUS.OK).send(success('Topic is removed from Trainer'));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}

module.exports = new AdminController();