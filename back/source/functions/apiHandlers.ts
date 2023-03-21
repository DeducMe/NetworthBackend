import { Response, Request } from 'express';
import jsonWebToken from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../config/config';

const allowedMethods = ['/api/user/register', '/api/user/login', '/apiDocs', '/api/wipe'];

export function sendBackHandler(res: Response, dataName: string, data: any) {
    return Promise.resolve()
        .then(() => {
            return res.status(200).json({
                [dataName]: data
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
}

export function errorHandler(res: Response, error: any, code?: number) {
    return Promise.resolve().then(() => {
        return res.status(code || res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message,
            ...error.errors
        });
    });
}

export async function checkAuthToken(res: Response, req: Request) {
    if (allowedMethods.includes(req.url)) return { success: true, message: null };
    let authHeader = req?.headers?.authorization;
    if (!authHeader) {
        return { success: false, message: 'Authorization header not found' };
    }
    try {
        await jsonWebToken.verify(authHeader, JWT_SECRET_TOKEN);
    } catch {
        return { success: false, message: 'Token is invalid' };
    }

    return { success: true, message: null };
}
