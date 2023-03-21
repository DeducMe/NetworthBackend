import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Categories from './categoriesModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, image } = req.body;

        const categories = new Categories({ name, image });

        const data = await categories.save();

        sendBackHandler(res, 'categories', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await Categories.find().exec();
    sendBackHandler(res, 'categories', data);
};

export default { getAll, create };
