const express = require('express');
const homeController = require('../controllers/home');
const router = express.Router();
const validator = require('../middlewares/validation');
const { checkAuth } = require('../middlewares/auth');

router.get('/courses', homeController.getAllCourse);

router.get('/courses/:courseId', homeController.getCourse);

router.get('/batch/courses/:batchId', homeController.getBatchAllCourse);

router.get('/trainers/:trainerId', homeController.getTrainer);

router.get('/trainers/', homeController.getAllTrainers);

router.get('/trainees/:traineeId', homeController.getTrainee);

router.get('/trainees/', homeController.getAllTrainees);

router.get('/batches/', homeController.getAllBatches);

router.get('/batches/:batchId', homeController.getBatch);

router.get('/topics/', homeController.getTopics);

router.get('/topics/:topicId', homeController.getSingleTopics);

module.exports = router;