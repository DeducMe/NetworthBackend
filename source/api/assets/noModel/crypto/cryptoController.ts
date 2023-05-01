import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler, typeCheckErrorHandler } from '../../../../functions/apiHandlers';
import { checkTypes } from '../../../../functions/common';
import profileModal from '../../../users/profile/profileModal';
import assetsModal from '../../assets/assetsModal';
import currencyModal from '../../currency/currencyModal';
import typesModal from '../../types/typesModal';
import { coinToBtc, coinToStable, symbolsCoinGecko, symbolsCoinGeckoById } from '../../../../functions/coingecko';
import { btcToFiat, currencyExchangeCC } from '../../../../functions/exchangerate';
import assetsChangeLogModal from '../../assetsChangeLog/assetsChangeLogModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, sysname, amount, price, currency } = req.body;
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

        let convertedTickerPrice;

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
                convertedTickerPrice = tickerPrice / exchangeRate.info.rate;
            }
            newCoinPrice = (newCoinPrice * amount + oldCoinPrice * oldCoinAmount) / newCoinAmount;
        }
        const newAsset = {
            name: name,
            sysname: sysname,
            price: newCoinPrice * newCoinAmount,
            pricePerItem: newCoinPrice,
            amount: newCoinAmount,
            type: coinType.id,
            currency: alreadyBoughtCoins?.currency._id || currency,
            userProfileId: profile.id
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
            amount,
            userProfileId: profile.id
        }).save();

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

        console.log(prices, coinCreatedInCurrency, profileCurrency.toLowerCase());

        let pricePerItem = cryptoItem.pricePerItem;
        let priceTotal = cryptoItem.price;

        if (prices[coinCreatedInCurrency]) {
            pricePerItem = cryptoItem.pricePerItem * prices[coinCreatedInCurrency][profileCurrency.toLowerCase()];
            priceTotal = cryptoItem.price * prices[coinCreatedInCurrency][profileCurrency.toLowerCase()];
        }

        const allTime = (pricePerItem - currentPrice) * cryptoItem.amount;
        const allTimePercent = (pricePerItem / currentPrice) * 100 - 100;

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
    const data = await symbolsCoinGecko();
    sendBackHandler(res, 'crypto', data);
};

export default { getAll, create, getList };
