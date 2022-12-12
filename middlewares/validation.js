const { body } = require('express-validator');
const User = require('../models/user');

const validator = {
    signin: [
        body('email').trim().isEmail().withMessage('E-mail is invalid'),
        body('password').trim().notEmpty().withMessage('Password is required'),
    ],
    createCourse: [
        body('name')
            .notEmpty()
            .withMessage('Name is required')
            .isString()
            .withMessage('Name must be string!'),
        body('category')
            .notEmpty()
            .withMessage('category is required')
            .isString()
            .withMessage('category must be string!'),
        body('detail')
            .notEmpty()
            .withMessage('detail is required')
            .isString()
            .withMessage('detail must be string!'),
    ],
    updateCourse: [
        body('batchId')
            .notEmpty()
            .withMessage('batchId is required'),
        body('name')
            .notEmpty()
            .withMessage('Name is required')
            .isString()
            .withMessage('Name must be string!'),
        body('category')
            .notEmpty()
            .withMessage('category is required')
            .isString()
            .withMessage('category must be string!'),
        body('detail')
            .notEmpty()
            .withMessage('detail is required')
            .isString()
            .withMessage('detail must be string!'),
    ],
    createTrainee: [
        body('name','Name is required and must be string').trim().notEmpty().isString(),
        body('email').trim().isEmail().withMessage('E-mail is invalid').custom(async(value) => {
            const user = await User.findOne({ email: value }).exec();
            if (user) {
                return Promise.reject("Trainee is already exists!");
            }
            return true;
        }),
        body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 character')
    ],
    updateTrainee: [
        body('name')
            .notEmpty()
            .withMessage('Name is required')
            .isString()
            .withMessage('Name must be string!'),
        body('email')
            .notEmpty()
            .withMessage('email is required')
            .isString()
            .withMessage('email must be string!'),
        body('password')
            .notEmpty()
            .withMessage('password is required')
            .isString()
            .withMessage('password must be string')
    ],   
    resetPasswordMail: body('email')
        .trim()
        .isEmail()
        .withMessage('Please give a valid email'),
    
    resetPassword: [
        body("token").trim().isString().withMessage("Token is required and must be string"),
        body("userId").trim().isString().withMessage("userId is required and must be string"),
        body("password")
          .trim()
          .isLength({ min: 6 })
          .withMessage("Passowrd must be at least 6 character"),
        body("confirmPassword")
          .trim()
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error("Password doesn't match!");
            }
            return true;
          }),
    ]
};

module.exports = validator;