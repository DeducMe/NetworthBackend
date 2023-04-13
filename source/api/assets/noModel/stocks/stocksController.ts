import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler, typeCheckErrorHandler } from '../../../../functions/apiHandlers';
import { checkTypes } from '../../../../functions/common';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sysname } = req.body;
        const types = {
            sysname: 'string'
        };

        const check = checkTypes({ sysname }, types);

        if (!check) return typeCheckErrorHandler(res, types);

        sendBackHandler(res, 'stocks', check);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    sendBackHandler(res, 'stocks', {});
};

export default { getAll, create };
