import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler, typeCheckErrorHandler } from '../../../../functions/apiHandlers';
import { checkTypes } from '../../../../functions/common';
import { findStockHelper, getStock } from '../../../../functions/alphavantage';
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

        // check existance of a stock
        const checkSysnameExistance = await getStock(sysname);
        if (checkSysnameExistance['Error Message']) return errorHandler(res, { message: 'Stock doesnt exist' }, 422);

        let tickerPrice = price;

        if (!tickerPrice) {
            // @ts-ignore
            tickerPrice = checkSysnameExistance?.['Global Quote']?.['05. price'];
            if (!tickerPrice) return errorHandler(res, { message: 'Couldnt get ticker price' }, 500);
        }

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const stockType = await typesModal.findOne({ sysname: 'STOCKS' });
        if (!stockType) return errorHandler(res, { message: 'Cant find stock type in db' }, 500);

        const alreadyBoughtStocks = await assetsModal.findOne({ name: sysname });

        const { price: oldStockPrice, amount: oldStockAmount } = alreadyBoughtStocks || {};

        let newStockPrice = tickerPrice;
        let newStockAmount = amount;

        if (!!oldStockPrice && !!oldStockAmount) {
            newStockAmount += oldStockAmount;
            newStockPrice = (newStockPrice * amount + oldStockPrice * oldStockAmount) / newStockAmount;
        }
        const newAsset = {
            name: sysname,
            price: newStockPrice,
            amount: newStockAmount,
            type: stockType.id,
            currency,
            userProfileId: profile.id
        };
        let data;
        if (alreadyBoughtStocks) {
            data = await alreadyBoughtStocks.updateOne(newAsset).exec();
        } else {
            data = await new assetsModal(newAsset).save();
        }

        sendBackHandler(res, 'stocks', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const findStock = async (req: Request, res: Response, next: NextFunction) => {
    let { name } = req.body;
    const types = {
        name: 'string'
    };

    // check passed types
    const check = checkTypes({ name }, types);
    if (!check) return typeCheckErrorHandler(res, types);

    const foundStocks = await findStockHelper(name);
    if (!foundStocks?.['bestMatches']) return errorHandler(res, { message: 'Some error happened' }, 422);
    let mappedStock = [];

    for (const item of foundStocks['bestMatches']) {
        const currency = await currencyModal.findOne({ sysname: item['8. currency'] });
        if (!currency) return errorHandler(res, { message: `Cant find ${item['8. currency']} currency in db` }, 500);

        mappedStock.push({ symbol: item['1. symbol'], currency, name: item['2. name'] });
    }
    return sendBackHandler(res, 'stocks', mappedStock);
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);
    const stockType = await typesModal.findOne({ sysname: 'STOCKS' });
    if (!stockType) return errorHandler(res, { message: 'Cant find stock type in db' }, 500);

    const stocks = await assetsModal
        .find({ type: stockType.id })
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
    for (const item of stocks) {
        let stock = await getStock(item.name);

        if (stock['Error Message'] || stock['Note'] || !stock?.['Global Quote']?.['10. change percent'])
            return errorHandler(res, { message: 'Some error happened - ' + (stock['Note'] || stock['Error Message']) }, 422);

        stock = stock['Global Quote'];

        data.push({
            ...item,
            intraday: Number(Number(stock['10. change percent'].slice(0, -1)).toFixed(2)),
            allTime: Number((((stock['05. price'] - item.price) / stock['05. price']) * 100).toFixed(2))
        });
    }

    sendBackHandler(res, 'stocks', data);
};

export default { getAll, create, findStock };
