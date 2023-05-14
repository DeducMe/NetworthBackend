import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import User from './userModal';
import Profile from '../profile/profileModal';

import bcrypt from 'bcrypt';
import jsonWebToken from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../../../config/config';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { login, password, name } = req.body;

        const stringifiedPass = password.toString();
        if (stringifiedPass < 4) {
            return errorHandler(res, { message: 'Password should contain at least four characters' }, 422);
        }
        const userExist = await User.findOne({ login }).exec();
        if (userExist) return errorHandler(res, { message: 'This login is already registered' }, 422);

        const user = new User({
            login,
            password: bcrypt.hashSync(stringifiedPass, 10)
        });

        const profile = new Profile({
            userId: user._id,
            name
        });

        const token = jsonWebToken.sign({ id: user._id, login: user.login }, JWT_SECRET_TOKEN);

        await user.save();
        await profile.save();

        sendBackHandler(res, 'token', token);
    } catch (e) {
        errorHandler(res, e);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { login, password } = req.body;

        const stringifiedPass = password.toString();
        if (stringifiedPass < 4) {
            return errorHandler(res, { message: 'Password should contain at least four characters' }, 422);
        }

        const user = await User.findOne({ login }).exec();
        if (!user) return errorHandler(res, { message: 'User not found, try other login' }, 422);

        try {
            const passwordCompare = await bcrypt.compareSync(stringifiedPass, user.password);
            console.log(stringifiedPass, user.password);

            if (!passwordCompare) return errorHandler(res, { message: 'Password is wrong, try again' }, 422);
        } catch (e) {
            return errorHandler(res, e);
        }
        const token = jsonWebToken.sign({ id: user._id, login: user.login }, JWT_SECRET_TOKEN);
        sendBackHandler(res, 'token', token);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
    let { ids } = req.body;
    const data = await User.find({ _id: { $in: ids } }).exec();
    sendBackHandler(res, 'users', data);
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await User.find().exec();
    sendBackHandler(res, 'users', data);
};

export default { create, login, getAll, getUser };
