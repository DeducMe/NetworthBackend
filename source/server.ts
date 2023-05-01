import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';

import logging from './config/logging';
import config from './config/config';
import profileRoute from './api/users/profile/profileRoute';
import usersDataRoute from './api/users/users/userRoute';
import assetsRoute from './api/assets/assets/assetsRoute';
import assetsTypesRoute from './api/assets/assetsAdditional/assetsAdditionalTypesDict/assetsAdditionalTypesRoute';
import assetsTypesItemRoute from './api/assets/assetsAdditional/assetsAdditionalTypesItem/assetsAdditionalTypesItemRoute';

// @ts-ignore
import docs from 'express-mongoose-docs';
import { checkAuthToken, errorHandler } from './functions/apiHandlers';
import categoriesRoute from './api/assets/categories/categoriesRoute';
import currencyRoute from './api/assets/currency/currencyRoute';
import typesRoute from './api/assets/types/typesRoute';
import stocksRoute from './api/assets/noModel/stocks/stocksRoute';
import cryptoRoute from './api/assets/crypto/cryptoRoute';
import assetsChangeLogRoute from './api/assets/assetsChangeLog/assetsChangeLogRoute';

// import errorHandler from './errorHandling';
const NAMESPACE = 'Server';
export const app = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info(NAMESPACE, 'Mongo Connected');
    })
    .catch((error) => {
        logging.error(NAMESPACE, error.message, error);
    });
mongoose.connection.on('open', function () {
    // logging.info(NAMESPACE, 'db dropped');
    // mongoose.connection.dropDatabase();
});
docs(app, mongoose);

/** Log the request */
app.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(async (req, res, next) => {
    const authed = await checkAuthToken(res, req);
    if (!authed.success) {
        return await errorHandler(res, { message: authed.message }, 405);
    }
    next();
});

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.use('/api/', usersDataRoute);
app.use('/api/', profileRoute);
app.use('/api/', assetsRoute);
app.use('/api/', assetsTypesRoute);
app.use('/api/', categoriesRoute);
app.use('/api/', currencyRoute);
app.use('/api/', assetsTypesItemRoute);
app.use('/api/', typesRoute);
app.use('/api/', stocksRoute);
app.use('/api/', cryptoRoute);
app.use('/api/', assetsChangeLogRoute);

app.delete('/api/wipe', async (req, res, next) => {
    mongoose.connection.dropDatabase();
    return res.status(200).json({});
});

const httpServer = http.createServer(app);
console.log(config.server);
httpServer.listen(config.server.port, config.server.hostname, () => logging.info(NAMESPACE, `Server is running on http://${config.server.hostname}:${config.server.port}/`));

// const finnhub = require('finnhub');

// const api_key = finnhub.ApiClient.instance.authentications['api_key'];
// api_key.apiKey = ''; // Replace this
// const finnhubClient = new finnhub.DefaultApi();

// finnhubClient.cryptoCandles('BINANCE:BTCUSDT', 'D', 1590988249, 1591852249, (error: any, data: any, response: any) => {
//     console.log(data);
// });
