const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const adminRouter = require('./routes/admin');
const trainerRouter = require('./routes/trainer');
const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');

const databaseConnection = require('./config/database');
const path = require('path');

const app = express();
dotenv.config();
const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(express.json());

app.use('/admin', adminRouter);
app.use('/trainer', trainerRouter);
app.use('/', homeRouter);
app.use(authRouter);

app.use((req, res, next) => {
    res.status(HTTP_STATUS.NOT_FOUND).send(failure('NOT FOUND'));
});

app.use((err, req, res, next) => {
    // console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(
        failure('Internal Server Error!', err.message)
    );
});

databaseConnection(() => {
    app.listen(port, () => {
        console.log(`App listening on port`, port);
    });
});