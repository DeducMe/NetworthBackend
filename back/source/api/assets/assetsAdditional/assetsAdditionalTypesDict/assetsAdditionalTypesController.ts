import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../../functions/apiHandlers';
import AssetsAdditionalTypes from './assetsAdditionalTypesModal';

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await AssetsAdditionalTypes.find().exec();

    sendBackHandler(res, 'assetsAdditionalTypes', data);
};

export default { getAll };
