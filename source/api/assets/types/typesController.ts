import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Types from './typesModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, sysname } = req.body;

        const data = await new Types({ name, sysname }).save();

        console.log(data);
        sendBackHandler(res, 'types', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await Types.find().exec();

    sendBackHandler(res, 'types', data);
};

export default { getAll, create };
