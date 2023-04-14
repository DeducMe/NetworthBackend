import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler, typeCheckErrorHandler } from '../../../../functions/apiHandlers';
import { checkTypes } from '../../../../functions/common';
import { getCoin } from '../../../../functions/alphavantage';
import profileModal from '../../../users/profile/profileModal';
import assetsModal from '../../assets/assetsModal';
import currencyModal from '../../currency/currencyModal';
import typesModal from '../../types/typesModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sysname, amount, price, currency } = req.body;
        const types = {
            sysname: 'string',
            amount: 'number',
            currency: 'string'
        };

        // check passed types
        const check = checkTypes({ sysname, amount, currency }, types);
        if (!check) return typeCheckErrorHandler(res, types);

        const currencyObj = await currencyModal.findById(currency);
        if (!currencyObj) return errorHandler(res, { message: `Cant find passed currency in db` }, 422);
        // check existance of a coin
        const checkSysnameExistance = await getCoin(sysname, currencyObj.sysname);
        if (checkSysnameExistance['Error Message']) return errorHandler(res, { message: 'ALPHAVANTAGE error - ' + checkSysnameExistance['Error Message'] }, 422);

        let tickerPrice = price;

        if (!tickerPrice) {
            // @ts-ignore
            tickerPrice = checkSysnameExistance?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
            if (!tickerPrice) return errorHandler(res, { message: 'Couldnt get ticker price' }, 500);
        }

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const coinType = await typesModal.findOne({ sysname: 'CRYPTO' });
        if (!coinType) return errorHandler(res, { message: 'Cant find CRYPTO type in db' }, 500);

        const alreadyBoughtCoins = await assetsModal.findOne({ name: sysname });

        const { price: oldCoinPrice, amount: oldCoinAmount } = alreadyBoughtCoins || {};

        let newCoinPrice = tickerPrice;
        let newCoinAmount = amount;

        if (!!oldCoinPrice && !!oldCoinAmount) {
            newCoinAmount += oldCoinAmount;
            newCoinPrice = (newCoinPrice * amount + oldCoinPrice * oldCoinAmount) / newCoinAmount;
        }
        const newAsset = {
            name: sysname,
            price: newCoinPrice,
            amount: newCoinAmount,
            type: coinType.id,
            currency,
            userProfileId: profile.id
        };
        let data;
        if (alreadyBoughtCoins) {
            data = await alreadyBoughtCoins.updateOne(newAsset).exec();
        } else {
            data = await new assetsModal(newAsset).save();
        }

        sendBackHandler(res, 'crypto', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);
    const coinType = await typesModal.findOne({ sysname: 'CRYPTO' });
    if (!coinType) return errorHandler(res, { message: 'Cant find coin type in db' }, 500);

    const crypto = await assetsModal
        .find({ type: coinType.id })
        .lean()
        .populate([
            'type',
            'categories',
            'currency',
            'additional',
            {
                path: 'additional',
                populate: {
                    path: 'type'
                }
            }
        ])
        .exec();

    let data = [];
    for (const item of crypto) {
        let coin = await getCoin(item.name, item.currency.sysname);

        if (coin['Error Message'] || coin['Note']) return errorHandler(res, { message: 'Some error happened - ' + (coin['Note'] || coin['Error Message']) }, 422);

        coin = coin['Realtime Currency Exchange Rate'];

        data.push({
            ...item,
            allTime: Number((((coin['5. Exchange Rate'] - item.price) / coin['5. Exchange Rate']) * 100).toFixed(2))
        });
    }

    sendBackHandler(res, 'crypto', data);
};

export default { getAll, create };
