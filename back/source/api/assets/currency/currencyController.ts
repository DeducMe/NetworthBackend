import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Currency from './currencyModal';

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

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await Currency.find().exec();
    sendBackHandler(res, 'currency', data);
};

export default { getAll, create };
