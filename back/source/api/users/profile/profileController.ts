import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Profile from './profileModal';
import jsonWebToken from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../../../config/config';
import profileModal from './profileModal';

const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await jsonWebToken.verify(req?.headers?.authorization || '', JWT_SECRET_TOKEN);
        let user;
        if (decoded && typeof decoded !== 'string') {
            user = await profileModal.findOne({ userId: decoded.id }).exec();
        } else {
            return errorHandler(res, 'decode of auth header went wrong', 500);
        }

        if (!user) return errorHandler(res, 'Profile not found', 500);

        return sendBackHandler(res, 'profile', user);
    } catch (e) {
        return errorHandler(res, e);
    }
};

const put = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await jsonWebToken.verify(req?.headers?.authorization || '', JWT_SECRET_TOKEN);
    if (!decoded || typeof decoded === 'string') {
        return errorHandler(res, 'decode of auth header went wrong', 500);
    }

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { ...req.body },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

export default { get, put };
