import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Profile from './profileModal';
import jsonWebToken from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../../../config/config';
import profileModal from './profileModal';

import assetsModal from '../../assets/assets/assetsModal';
import { btcToFiat, currencyExchangeCC } from '../../../functions/exchangerate';
import assetsChangeLogModal from '../../assets/assetsChangeLog/assetsChangeLogModal';
import { Schema } from 'mongoose';
import Assets from '../../assets/assets/assetsInterface';
import { coinToBtc, coinToStable } from '../../../functions/coingecko';

const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await decodeToken(req?.headers?.authorization || '');

        if (!decoded) {
            return errorHandler(res, 'decode of auth header went wrong', 500);
        }

        let user = await profileModal.findOne({ userId: decoded.id }).populate(['currencySet']).exec();

        if (!user) return errorHandler(res, 'Profile not found', 500);

        return sendBackHandler(res, 'profile', user);
    } catch (e) {
        return errorHandler(res, e);
    }
};

const getNetworth = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const profile = await Profile.findOne({ userId: decoded.id }).populate(['currencySet']);
    if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);

    if (!profile?.currencySet?.sysname) return errorHandler(res, 'Please set currency', 405);
    // const assets = await assetsModal.find({ userProfileId: profile.id }).populate(['currency']);
    const assetsChangeLog = await assetsChangeLogModal
        .find({ userProfileId: profile.id })
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

    // Получить изменения за все время
    //
    // Взять все обмены за сегодня
    // Перевести в валюту профиля
    // Посчитать среднюю цену на каждый ассет
    // Посмотреть цену на каждый ассет
    // Сравнить со средней ценой
    // Прибавить значение к acc

    // За сегодня:
    // Если дата меньше вчерашней даты, прибавить к accToday

    // @ts-ignore
    let acc = 0;
    let accTotalChangeToday = 0;
    let accTotalChange = 0;

    type AssetsWithPrice = Assets & { priceChange?: number };
    let assetsMerged: AssetsWithPrice[] = [];

    const assetsChangeLogFiltered = assetsChangeLog.filter((item) => !!item.asset.currency);

    for (let index = 0; index < assetsChangeLogFiltered.length; index++) {
        const log = assetsChangeLogFiltered[index];
        const asset = log.asset;

        // Перевести в валюту профиля
        const exchangeRate = await currencyExchangeCC(asset.currency.sysname, profile.currencySet.sysname);

        const converted = log.price * exchangeRate.info.rate;
        acc += converted;

        // Посчитать среднюю цену на каждый ассет
        // price - средняя цена

        const foundedMergeAsset = assetsMerged.find((item) => item._id === asset._id);

        const newAmount = log.amount;

        if (!!foundedMergeAsset) {
            foundedMergeAsset.amount += newAmount;
            foundedMergeAsset.price += converted * newAmount;
            assetsMerged = [...assetsMerged.filter((item) => item._id !== foundedMergeAsset._id), foundedMergeAsset];
        } else {
            asset.amount = newAmount;
            asset.price = converted;

            assetsMerged.push(asset);
        }

        console.log(assetsMerged);
    }

    // Посмотреть цену на каждый ассет
    const profileCurrency = profile.currencySet.sysname.toLowerCase();
    const prices = await coinToStable({ idsFrom: assetsMerged.map((asset) => asset.sysname.toLowerCase()), idsTo: [profileCurrency] });

    Object.keys(prices).forEach((key) => {
        const price = prices[key];
        const priceIntraday = price[`${profileCurrency}_24h_change`];
        const currentPrice = price[`${profileCurrency}`];

        // Сравнить со средней ценой
        const cryptoItem = assetsMerged.find((item) => item.sysname === key);
        if (!cryptoItem) return console.log('CRINGE in assetsMerged.find((item) => item.currency.sysname === key);');

        const allTime = currentPrice * cryptoItem.amount - cryptoItem.price;

        accTotalChange += allTime;
    });

    console.log(acc, accTotalChange);
    const accTotalChangePercent = (acc / (acc - accTotalChange)) * 100 - 100;

    await profile
        .updateOne({
            total: acc
        })
        .exec();

    sendBackHandler(res, 'profile', {
        total: acc,
        totalChange: accTotalChange,
        totalChangePercent: accTotalChangePercent
    });
};

const put = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { ...req.body },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

const setCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { currencySet: req.body.currency },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

export default { get, put, setCurrency, getNetworth };
