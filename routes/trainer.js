const express = require('express');
const adminController = require('../controllers/admin');
const trainerController = require('../controllers/trainer');
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

// task
router.post(
    '/task', 
    checkAuth, 
    upload.single('taskImage'),
    trainerController.postTask
);

router.get(
    '/task/:trainerId', 
    checkAuth, 
    trainerController.getTrainerAllTask
);

router.get(
    '/tasks/:taskId', 
    checkAuth, 
    trainerController.getTask
);

router.post(
    '/postSubmitMarks/:taskId',
    checkAuth,
    trainerController.postSubmitMarks
);

router.get(
    '/getBatchAllTask/:batchId',
    checkAuth,
    trainerController.getBatchAllTask
);

module.exports = router;