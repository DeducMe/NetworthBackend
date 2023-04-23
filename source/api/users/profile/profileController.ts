import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Profile from './profileModal';
import jsonWebToken from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../../../config/config';
import profileModal from './profileModal';

import assetsModal from '../../assets/assets/assetsModal';
import { currencyExchangeCC } from '../../../functions/cryptocompare';

const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await decodeToken(req?.headers?.authorization || '');

        if (!decoded) {
            return errorHandler(res, 'decode of auth header went wrong', 500);
        }

        let user = await profileModal.findOne({ userId: decoded.id }).exec();

        if (!user) return errorHandler(res, 'Profile not found', 500);

        return sendBackHandler(res, 'profile', user);
    } catch (e) {
        return errorHandler(res, e);
    }
};

const getNetworth = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const profile = await Profile.findOne({ userId: decoded.id }).populate(['currencySet']);
    if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);
    if (!profile?.currencySet?.sysname) return errorHandler(res, 'Please set currency', 405);
    const assets = await assetsModal.find({ userProfileId: profile.id }).populate(['currency']);

    let acc = 0;
    await Promise.all(
        assets.map(async (asset) => {
            // const exchangeRate = await currencyExchange(asset.currency.sysname, profile.currencySet.sysname);
            // acc += asset.price * exchangeRate['Realtime Currency Exchange Rate']['5. Exchange Rate'];
            const exchangeRate = await currencyExchangeCC(asset.currency.sysname, profile.currencySet.sysname);
            const converted = asset.price * exchangeRate[profile.currencySet.sysname];
            acc += converted;
        })
    );

    sendBackHandler(res, 'profile', acc);
};

const put = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { ...req.body },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

const setCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { currencySet: req.body.currency },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

export default { get, put, setCurrency, getNetworth };
