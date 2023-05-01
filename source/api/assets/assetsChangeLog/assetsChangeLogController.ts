import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import AssetsChangeLog from './assetsChangeLogModal';
import profileModal from '../../users/profile/profileModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, asset, type, price, amount, operationDate } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);

        const data = await new AssetsChangeLog({ name, asset, type, price, amount, userProfileId: profile.id, operationDate }).save();

        sendBackHandler(res, 'assetsChangeLog', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const profile = await profileModal.findOne({ userId: decoded.id });
    if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);

    const data = await AssetsChangeLog.find({ userProfileId: profile.id })
        .populate([
            {
                path: 'asset',
                populate: {
                    path: 'type'
                }
            },
            {
                path: 'asset',
                populate: {
                    path: 'categories'
                }
            },
            {
                path: 'asset',
                populate: {
                    path: 'currency'
                }
            }
        ])
        .exec();
    sendBackHandler(res, 'assetsChangeLog', data);
};

export default { getAll, create };
