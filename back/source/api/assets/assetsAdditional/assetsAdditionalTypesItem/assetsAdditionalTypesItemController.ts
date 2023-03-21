import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../../functions/apiHandlers';
import AssetsAdditionalTypesItem from './assetsAdditionalTypesItemModal';
import assetsAdditionalTypesModal from '../assetsAdditionalTypesDict/assetsAdditionalTypesModal';

export const createAssetsAdditionalTypesItem = async ({ name, key, value }: { name: string; key?: string; value: any }) => {
    name = name.toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1);

    let typesDataItem = await assetsAdditionalTypesModal.findOne({ name });

    if (!typesDataItem) {
        await new assetsAdditionalTypesModal({ name, keys: key ? [key] : [] }).save();
    } else if (key) {
        await typesDataItem.updateOne({ name, keys: [...typesDataItem.keys.filter((item) => item !== key), key] }).exec();
    }

    typesDataItem = await assetsAdditionalTypesModal.findOne({ name });

    const itemsData = await new AssetsAdditionalTypesItem({ type: typesDataItem!._id, value }).save();

    return itemsData!._id;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, key, value } = req.body;
        const itemsData = createAssetsAdditionalTypesItem({ name, key, value });
        sendBackHandler(res, 'assetsAdditionalTypesItem', itemsData);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await AssetsAdditionalTypesItem.find().populate(['type']).exec();

    sendBackHandler(res, 'assetsAdditionalTypesItem', data);
};

export default { getAll, create };
