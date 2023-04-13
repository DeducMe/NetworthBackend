import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler, typeCheckErrorHandler } from '../../../../functions/apiHandlers';
import { checkTypes } from '../../../../functions/common';
import { getStock } from '../../../../functions/alphavantage';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sysname, amount } = req.body;
        const types = {
            sysname: 'string',
            amount: 'number'
        };

        // check passed types
        const check = checkTypes({ sysname, amount }, types);
        if (!check) return typeCheckErrorHandler(res, types);

        // check existance of a stock
        const checkSysnameExistance = await getStock(sysname);
        if (checkSysnameExistance['Error Message']) return errorHandler(res, { message: 'Stock doesnt exist' }, 422);

        sendBackHandler(res, 'stocks', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    sendBackHandler(res, 'stocks', {});
};

export default { getAll, create };
