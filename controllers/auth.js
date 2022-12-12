const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HTTP_STATUS = require('../utils/httpStatus');
const { success, failure } = require('../utils/commonResponse');
const { validationResult } = require('express-validator');
const { promisify } = require('util');
const crypto = require('crypto');
const sendMail = require('../config/mail');
const ejs = require('ejs');
const path = require('path');
const ejsRenderFile = promisify(ejs.renderFile);

class authController {
    // signin
    async signin(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure('Invalid Inputs', errors.array()));
            }

            const user = await User.findOne({ email: req.body.email }).exec();
            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure('Unauthorized user login'));
            }
            const passMatch = await bcrypt.compare(req.body.password, user.password);

            if (!passMatch) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure('Unauthorized user login'));
            }

            const userData = {
                _id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerify: user.isVerify
            };
            const jwtToken = jwt.sign(userData, process.env.JWT_SECRET_KEY, {expiresIn: '24h'});
            const resData = {
                access_token: jwtToken,
                ...userData
            }

            return res.status(HTTP_STATUS.OK).send(success('Signed in successfully!', resData));

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // send reset password
    async sendResetPasswordMail(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                    .send(failure('Invalid Inputs', errors.array()));
            }
            const email = req.body.email;
            const user = await User.findOne({ email: email });
            if (!user) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("User doen't exist!"));
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
            await user.save();

            const resetPasswordUrl = path.join(
                process.env.FRONTEND_URI,
                'reset-password',
                resetToken,
                user._id.toString()
            );
            const htmlStr = await ejsRenderFile(
                path.join(__dirname, '..', 'mails', 'ResetPassword.ejs'),
                { name: user.name, resetUrl: resetPasswordUrl }
            );

            sendMail({
                from: "Manga Shop <shop@manga.com>",
                to: email,
                subject: "Reset Your Password",
                html: htmlStr
            });

            return res.status(HTTP_STATUS.OK).send(success('Reset Password link is sent!'));

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // reset password
    async resetPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                    .send(failure('Invalid Inputs', errors.array()));
            }

            const token = req.body.token;
            const userId = req.body.userId;
            const password = req.body.password;

            const user = await User.findOne({ _id: userId, resetPasswordExpire: { $gt: Date.now() } });
            if (!user || user.resetPasswordToken !== token) {
                return res.status(HTTP_STATUS.FORBIDDEN).send(failure('Invalid Token!'));
            }

            user.password = await bcrypt.hash(password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(HTTP_STATUS.OK).send(success('Reset password is successfull!'));

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    // verify User
    async verifyUser (req, res, next) {
        // console.log('req', req);
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                    .send(failure('Invalid Inputs', errors.array()));
            }

            const token = req.params.token;
            const userId = req.params.userId;

            const user = await User.findOne({ _id: userId, verifyExpire: { $gt: Date.now() } });
            if (!user || user.verifyToken !== token) {
                return res.status(HTTP_STATUS.FORBIDDEN).send(failure('Invalid Token!'));
            }

            user.verifyToken = undefined;
            user.verifyExpire = undefined;
            user.isVerify = true;
            await user.save();

            return res.status(HTTP_STATUS.OK).send(success('user is verifyed'));

        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}

module.exports = new authController();
