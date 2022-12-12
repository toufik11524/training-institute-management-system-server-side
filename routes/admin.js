const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();
const validator = require('../middlewares/validation');
const multer = require('multer');
const path = require('path');
const admin = require('../controllers/admin');
const { isVerify, checkAuth } = require('../middlewares/auth');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file) {
            cb(null, 'images');
        } else {
            cb('No file found', null);
        }
    },
    filename: (req, file, cb) => {
        if (file) {
            cb(
                null,
                file.originalname.split('.')[0].replace(/\ /g, '') +
                    Date.now() +
                    path.extname(file.originalname)
            );
        } else {
            cb('No file found', null);
        }
    },
});

const checkImage = (req, file, cb) => {
    if (file) {
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } else {
        cb('No file found', false);
    }
};

const upload = multer({
    storage: fileStorage,
    // limits: 30000,
    fileFilter: checkImage,
});

// Trainers
router.post(
    '/create-trainer',
    checkAuth,
    isVerify,
    upload.single('trainerImage'),
    adminController.postTrainer
);

router.put(
    '/edit-trainer/:trainerId',
    checkAuth,
    isVerify,
    upload.single('trainerImage'),
    adminController.putEditTrainer
);

router.delete(
    '/delete-trainer/:trainerId',
    checkAuth,
    isVerify,
    adminController.deleteTrainer
);

// Trainees
router.post(
    '/create-trainee',
    checkAuth,
    isVerify,
    upload.single('traineeImage'),
    validator.createTrainee,
    adminController.postTrainee
);

router.put(
    '/edit-trainee/:traineeId',
    checkAuth,
    // validator.updateTrainee,
    upload.single('traineeImage'),
    adminController.putTrainee
);

router.delete(
    '/delete-trainee/:traineeId',
    checkAuth,
    isVerify,
    adminController.deleteTrainee
);

// course
router.post(
    '/create-course',
    checkAuth,
    isVerify,
    upload.single('courseImage'),
    validator.createCourse,
    adminController.postCourse
);

router.put(
    '/update-course/:courseId',
    checkAuth,
    isVerify,
    upload.single('courseImage'),
    validator.updateCourse,
    adminController.putCourse
);

router.delete(
    '/delete-course/:courseId',
    checkAuth,
    isVerify,
    adminController.deleteCourse
);

// batch
router.post(
    '/create-batch',
    checkAuth,
    isVerify,
    // validator.createBatch,
    adminController.postBatch
);

router.put(
    '/update-batch/:batchId',
    adminController.putBatch
);

router.delete(
    '/delete-batch/:batchId',
    adminController.deleteBatch
);

// topic 
router.post(
    '/create-topic',
    checkAuth,
    isVerify,
    adminController.postTopic
);

router.put(
    '/update-topic/:topicId',
    checkAuth,
    isVerify,
    adminController.putTopic
);

router.delete(
    '/delete-topic/:topicId',
    checkAuth,
    isVerify,
    adminController.deleteTopic
);

// add trainee to Batch
router.post(
    '/addToBatch/:batchId',
    adminController.addToBatch
);

// delete trainee from Batch
router.delete(
    '/deleteFromBatch/:batchId',
    checkAuth,
    adminController.deleteFromBatch
);

// add topic to Course
router.post(
    '/addToCourse/:courseId',
    checkAuth,
    isVerify,
    adminController.addToCourse
);

// delete topic from Course
router.delete(
    '/deleteFromCourse/:courseId',
    checkAuth,
    isVerify,
    adminController.deleteFromCourse
);

// add Topic to The Trainer
router.post(
    '/addToTrainer/:trainerId',
    checkAuth,
    isVerify,
    adminController.addToTrainer
);

// delete Topic from 
router.delete(
    '/removeToTrainer/:trainerId',
    checkAuth,
    isVerify,
    adminController.removeToTrainer
);

module.exports = router;