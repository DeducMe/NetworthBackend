import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Assets from './assetsModal';
import { createAssetsAdditionalTypesItem } from '../assetsAdditional/assetsAdditionalTypesItem/assetsAdditionalTypesItemController';
import profileModal from '../../users/profile/profileModal';

const put = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, name, categories, price, image, additional, currency, amount } = req.body;

        // let additionalLooped = [];

        // TODO добавить additional
        // for (const item of additional) {
        //     additionalLooped.push(await createAssetsAdditionalTypesItem(item));
        // }

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const assetToUpdate = await Assets.findOne({ userProfileId: profile.id, _id: _id });
        if (!assetToUpdate) return errorHandler(res, { message: 'Asset was not found' }, 422);

        const data = await assetToUpdate.updateOne({ name, amount, categories, price, image, currency }).exec();

        sendBackHandler(res, 'assets', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, categories, price, image, additional, currency, amount } = req.body;

        let additionalLooped = [];
        for (const item of additional) {
            additionalLooped.push(await createAssetsAdditionalTypesItem(item));
        }

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);

        const data = await new Assets({ name, amount, categories, price, image, additional: additionalLooped, currency, userProfileId: profile.id }).save();

        sendBackHandler(res, 'assets', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const deleteRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id } = req.body;

        if (!_id) return errorHandler(res, { message: `_id is not passed` }, 422);
        // check existance of a coin

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const foundedAsset = await Assets.findOne({ _id });
        if (!foundedAsset) return errorHandler(res, { message: `Cant find asset ` }, 422);

        await foundedAsset.deleteOne();

        sendBackHandler(res, 'assets', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    let { filters } = req.body;

    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const profile = await profileModal.findOne({ userId: decoded.id });
    if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);

    const additionalFilters: any = {};

    if (filters?.priceMin || filters?.priceMax) {
        additionalFilters.price = {};
        if (typeof filters.priceMin === 'number') additionalFilters.price.$gte = filters?.priceMin;
        if (typeof filters.priceMax === 'number') additionalFilters.price.$lt = filters?.priceMax;
    }

    if (filters?.categories) {
        additionalFilters.categories = { $in: filters.categories };
    }

    console.log(additionalFilters);

    const data = await Assets.find({ userProfileId: profile.id, ...additionalFilters })
        .where('price')
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
    sendBackHandler(res, 'assets', data);
};

export default { getAll, create, put, deleteRow };
