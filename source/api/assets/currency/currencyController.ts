import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Currency from './currencyModal';
import { currencyExchange } from '../../../functions/alphavantage';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, sysname, image } = req.body;

        const currency = new Currency({ name, sysname, image });

        const data = await currency.save();

        sendBackHandler(res, 'currency', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const exchangeCurrency = async (req: Request, res: Response, next: NextFunction) => {
    let { from, to, amount } = req.body;

    if (!from || !to || !amount) return errorHandler(res, { message: 'wrong values' }, 422);

    const firstCurrency = await Currency.findById(from).exec();
    const secondCurrency = await Currency.findById(to).exec();

    if (!firstCurrency || !secondCurrency) return errorHandler(res, { message: 'cant find currency object' }, 422);

    const exchangeRate = await currencyExchange(firstCurrency.sysname, secondCurrency.sysname);
    const converted = amount * exchangeRate['Realtime Currency Exchange Rate']['5. Exchange Rate'];

    sendBackHandler(res, 'currency', converted);
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await Currency.find().exec();
    sendBackHandler(res, 'currency', data);
};

export default { getAll, create, exchangeCurrency };
