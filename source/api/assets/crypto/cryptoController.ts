import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler, typeCheckErrorHandler } from '../../../functions/apiHandlers';
import { checkTypes } from '../../../functions/common';
import profileModal from '../../users/profile/profileModal';
import assetsModal from '../assets/assetsModal';
import currencyModal from '../currency/currencyModal';
import typesModal from '../types/typesModal';
import { coinToBtc, coinToStable, searchSymbols, symbolsCoinGecko, symbolsCoinGeckoById, symbolsCoinGeckoRange } from '../../../functions/coingecko';
import { btcToFiat, currencyExchangeCC, currencyExchangeWithDateCC } from '../../../functions/exchangerate';
import assetsChangeLogModal from '../assetsChangeLog/assetsChangeLogModal';
import moment from 'moment';
import cryptoModal from './cryptoModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, sysname, amount, price, currency, operationDate } = req.body;
        const types = {
            name: 'string',
            sysname: 'string',
            amount: 'number',
            currency: 'string'
        };

        // check passed types
        const check = checkTypes({ sysname, amount, currency, name }, types);
        if (!check) return typeCheckErrorHandler(res, types);

        const currencyObj = await currencyModal.findById(currency);
        if (!currencyObj) return errorHandler(res, { message: `Cant find passed currency in db` }, 422);
        // check existance of a coin
        const checkSysnameExistance = await symbolsCoinGeckoById(sysname);
        if (!checkSysnameExistance || checkSysnameExistance?.error) return errorHandler(res, { message: 'COINGECKO error - ' + checkSysnameExistance?.error }, 422);

        const localCoin = await cryptoModal.findOne({ sysname: checkSysnameExistance.id });
        if (!localCoin) return errorHandler(res, { message: `Cant find coin in db` }, 422);

        let tickerPrice = price;

        if (!tickerPrice) {
            // @ts-ignore
            tickerPrice = checkSysnameExistance?.market_data?.current_price[currencyObj.sysname.toLowerCase() || 'usd'];
            if (!tickerPrice) return errorHandler(res, { message: 'Couldnt get ticker price' }, 500);
        }

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const coinType = await typesModal.findOne({ sysname: 'CRYPTO' });
        if (!coinType) return errorHandler(res, { message: 'Cant find CRYPTO type in db' }, 500);

        const alreadyBoughtCoins = await assetsModal.findOne({ sysname, userProfileId: profile.id }).populate('currency');

        const { pricePerItem: oldCoinPrice, amount: oldCoinAmount } = alreadyBoughtCoins || {};

        let convertedTickerPrice = tickerPrice;
        let newCoinPrice = tickerPrice;
        let newCoinAmount = amount;

        if (!!oldCoinPrice && !!oldCoinAmount) {
            newCoinAmount += oldCoinAmount;

            // this check is needed if crypto was bought for the first time in one currency, and
            // user bought the same crypto in different currency
            if (`${alreadyBoughtCoins?.currency._id}` !== `${currencyObj._id}`) {
                const coinCurrencyOldSysname = alreadyBoughtCoins!.currency.sysname.toLowerCase();
                const coinCurrencyNewSysname = currencyObj.sysname.toLowerCase();

                const exchangeRate = await currencyExchangeCC(coinCurrencyOldSysname, coinCurrencyNewSysname);

                newCoinPrice = newCoinPrice / exchangeRate.info.rate;
            }

            newCoinPrice = (newCoinPrice * amount + oldCoinPrice * oldCoinAmount) / newCoinAmount;
        }

        // TODO НЕ ИЗМЕНЯТЬ name
        const newAsset = {
            name: name,
            sysname: sysname,
            price: newCoinPrice * newCoinAmount,
            pricePerItem: newCoinPrice,
            amount: newCoinAmount,
            type: coinType.id,
            currency: alreadyBoughtCoins?.currency._id || currency,
            userProfileId: profile.id,
            crypto: localCoin._id
        };

        let assetToAddLogTo;
        let assetsLogChangeType = amount > 0 ? 'BUY' : 'SELL';

        if (alreadyBoughtCoins) {
            await alreadyBoughtCoins.updateOne(newAsset).exec();
            assetToAddLogTo = alreadyBoughtCoins;
        } else {
            assetToAddLogTo = await new assetsModal(newAsset).save();
        }

        await new assetsChangeLogModal({
            name: `${assetsLogChangeType} - ${name}`,
            asset: assetToAddLogTo._id,
            type: assetsLogChangeType,
            price: convertedTickerPrice,
            operationDate,
            amount,
            image: checkSysnameExistance.image.small,
            userProfileId: profile.id
        }).save();

        sendBackHandler(res, 'crypto', true);
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

        const foundedAsset = await assetsModal.findOne({ _id });
        if (!foundedAsset) return errorHandler(res, { message: `Cant find asset ` }, 422);

        const foundChangeLogs = await assetsChangeLogModal.find({ asset: _id });

        const filters: { _id?: { $in: string[] } } = {};

        if (foundChangeLogs?.length) filters._id = { $in: foundChangeLogs.map((item) => item._id) };

        await assetsChangeLogModal.deleteMany(filters);
        await foundedAsset.deleteOne();

        sendBackHandler(res, 'crypto', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);
    const coinType = await typesModal.findOne({ sysname: 'CRYPTO' });
    if (!coinType) return errorHandler(res, { message: 'Cant find coin type in db' }, 500);
    const profile = await profileModal.findOne({ userId: decoded.id }).populate(['currencySet']);
    if (!profile) return errorHandler(res, 'decode of auth header went wrong', 500);
    const profileCurrency = profile?.currencySet?.sysname;
    if (!profileCurrency) return errorHandler(res, 'Please set currency', 405);
    const crypto = await assetsModal
        .find({ type: coinType.id })
        .lean()
        .populate([
            'type',
            'categories',
            'currency',
            'additional',
            'crypto',
            {
                path: 'additional',
                populate: {
                    path: 'type'
                }
            }
        ])
        .exec();

    let data: any[] = [];

    const idsFrom = crypto.filter((item) => item.sysname).map((coin) => coin.sysname);
    const idsCurrencies = crypto.filter((item) => item.sysname).map((coin) => coin.currency.sysname.toLowerCase());
    const idsTo = [profileCurrency.toLowerCase()];

    const prices = await coinToStable({ idsFrom: [...idsFrom, ...idsCurrencies], idsTo });

    Object.keys(prices).forEach((key) => {
        const price = prices[key];
        const priceIntraday = price[`${profileCurrency.toLowerCase()}_24h_change`];
        const currentPrice = price[`${profileCurrency.toLowerCase()}`];

        const cryptoItem: any = crypto.find((item) => item.sysname === key);
        if (!cryptoItem) return;
        const coinCreatedInCurrency = cryptoItem.currency.sysname.toLowerCase();

        // const btcConvertedPrice = coin.btc * btcFiatPrice[profileCurrency];
        // const allTime = Number((((btcFiatPrice[profileCurrency] - btcConvertedPrice) / btcFiatPrice[profileCurrency]) * 100).toFixed(2));

        let pricePerItem = cryptoItem.pricePerItem;
        let priceTotal = cryptoItem.price;

        if (prices[coinCreatedInCurrency]) {
            pricePerItem = cryptoItem.pricePerItem * prices[coinCreatedInCurrency][profileCurrency.toLowerCase()];
            priceTotal = cryptoItem.price * prices[coinCreatedInCurrency][profileCurrency.toLowerCase()];
        }

        const allTime = (currentPrice - pricePerItem) * cryptoItem.amount;
        const allTimePercent = (currentPrice / pricePerItem) * 100 - 100;

        data.push({
            ...cryptoItem,
            price: priceTotal,
            pricePerItem,
            allTime,
            allTimePercent,
            currentPrice,
            priceIntraday
        });
    });

    sendBackHandler(res, 'crypto', data);
};

const getList = async (req: Request, res: Response, next: NextFunction) => {
    let { sort } = req.body;

    const data = await cryptoModal.find().select('-_id').sort(sort).exec();

    sendBackHandler(res, 'crypto', data);
};

const search = async (req: Request, res: Response, next: NextFunction) => {
    let { query } = req.body;
    const data = await searchSymbols(query);
    const dataMapped = data.coins.map((item) => ({
        name: item.name,
        sysname: item.id,
        marketCapRank: item.market_cap_rank,
        thumb: item.thumb,
        large: item.large,
        symbol: item.symbol
    }));
    sendBackHandler(res, 'crypto', dataMapped);

    const localDbCrypto = await cryptoModal.find({ sysname: { $in: data.coins.map((item) => item.id) } }).exec();

    for (let index = 0; index < data.coins.length; index++) {
        const item = data.coins[index];

        const cryptoItem = localDbCrypto.find((el) => el.sysname === item.id);
        await cryptoModal
            .updateOne(
                { id_: cryptoItem?._id },
                {
                    name: item.name,
                    sysname: item.id,
                    marketCapRank: item.market_cap_rank,
                    thumb: item.thumb,
                    large: item.large,
                    symbol: item.symbol
                }
            )
            .exec();
        if (!!cryptoItem?._id) return;

        await new cryptoModal({
            name: item.name,
            sysname: item.id,
            marketCapRank: item.market_cap_rank,
            thumb: item.thumb,
            large: item.large,
            symbol: item.symbol
        }).save();
    }
};

const getCryptoPriceByDate = async (req: Request, res: Response, next: NextFunction) => {
    let { operationDate, sysname, currency } = req.body;
    const currencyObj = await currencyModal.findById(currency);
    if (!currencyObj) return errorHandler(res, { message: `Cant find passed currency in db` }, 422);

    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);
    const profile = await profileModal.findOne({ userId: decoded.id });
    if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

    const DAY_TIMESTAMP = 86400;
    const fromDate = operationDate - DAY_TIMESTAMP * 2;
    const toDate = operationDate + DAY_TIMESTAMP * 2;

    const data = await symbolsCoinGeckoRange(sysname, fromDate, toDate);

    if (!data.prices?.length) return errorHandler(res, { message: `There is no crypto prices available at this datetime` }, 422);

    const prices = data.prices.map((item: number[]) => {
        const itemUnixStamp = item[0] / 1000;
        return [itemUnixStamp, item[1]];
    });
    // finding closest to date
    const goal = operationDate;
    const closest = prices.reduce((prev: number[], curr: number[]) => {
        return Math.abs(curr[0] - goal) < Math.abs(prev[0] - goal) ? curr : prev;
    });

    const buyDate = moment.unix(closest[0]).format('YYYY-MM-DD');
    const priceRates = await currencyExchangeWithDateCC(buyDate, 'USD', currencyObj.sysname.toUpperCase());

    if (!priceRates.rates) {
        return sendBackHandler(res, 'crypto', null);
    }

    const result = priceRates.rates[currencyObj.sysname.toUpperCase()] * closest[1];

    sendBackHandler(res, 'crypto', result);
};

export default { getAll, create, getList, getCryptoPriceByDate, search, deleteRow };
