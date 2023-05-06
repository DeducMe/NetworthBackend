import { NextFunction, Request, Response } from 'express';
import { errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Currency from './currencyModal';
import { currencyExchangeCC } from '../../../functions/exchangerate';

const currenciesObj = [
    { name: 'Russian rubles', sysname: 'RUB', symbol: '₽' },
    { name: 'United States dollars', sysname: 'USD', symbol: '$' },
    { name: 'Euro', sysname: 'EUR', symbol: '€' },
    { name: 'Great Britain Pound (GBX)', sysname: 'GBX', symbol: 'GBX' },
    { name: 'United Arab Emirates Dirham', sysname: 'AED', symbol: 'د.إ' },
    { name: 'Afghan Afghani', sysname: 'AFN', symbol: '؋' },
    { name: 'Albanian Lek', sysname: 'ALL', symbol: 'L' },
    { name: 'Armenian Dram', sysname: 'AMD', symbol: '֏' },
    { name: 'Brazilian Real', sysname: 'BRL', symbol: 'R$' },
    { name: 'Brunei Dollar', sysname: 'BND', symbol: 'B$' },
    { name: 'Angolan Kwanza', sysname: 'AOA', symbol: 'Kz' },
    { name: 'Bolivian Boliviano', sysname: 'BOB', symbol: 'Bs.' },
    { name: 'Azerbaijani Manat', sysname: 'AZN', symbol: '₼' },
    { name: 'Botswanan Pula', sysname: 'BWP', symbol: 'P' },
    { name: 'Bangladeshi Taka', sysname: 'BDT', symbol: '৳' },
    { name: 'Bermudan Dollar', sysname: 'BMD', symbol: 'BD$' },
    { name: 'Bulgarian Lev', sysname: 'BGN', symbol: 'лв' },
    { name: 'Aruban Florin', sysname: 'AWG', symbol: 'ƒ' },
    { name: 'Bahraini Dinar', sysname: 'BHD', symbol: '.د.ب' },
    { name: 'Bitcoin', sysname: 'BTC', symbol: '₿' },
    { name: 'Australian Dollar', sysname: 'AUD', symbol: 'A$' },
    { name: 'Bhutanese Ngultrum', sysname: 'BTN', symbol: 'Nu.' },
    { name: 'Bosnia-Herzegovina Convertible Mark', sysname: 'BAM', symbol: 'KM' },
    { name: 'Bahamian Dollar', sysname: 'BSD', symbol: 'B$' },
    { name: 'Argentine Peso', sysname: 'ARS', symbol: '$' },
    { name: 'Barbadian Dollar', sysname: 'BBD', symbol: 'Bds$' },
    { name: 'Burundian Franc', sysname: 'BIF', symbol: 'FBu' },
    { name: 'Netherlands Antillean Guilder', sysname: 'ANG', symbol: 'ƒ' },
    { name: 'Belarusian Ruble', sysname: 'BYN', symbol: 'Br' },
    { name: 'Belize Dollar', sysname: 'BZD', symbol: 'BZ$' },
    { name: 'Canadian Dollar', sysname: 'CAD', symbol: 'C$' },
    { name: 'Chilean Unit of Account (UF)', sysname: 'CLF', symbol: 'CLF' },
    { name: 'Swiss Franc', sysname: 'CHF', symbol: 'CHF' },
    { name: 'Chilean Peso', sysname: 'CLP', symbol: '$' },
    { name: 'Cuban Peso', sysname: 'CUP', symbol: '₱' },
    { name: 'Cuban Convertible Peso', sysname: 'CUC', symbol: 'CUC$' },
    { name: 'Colombian Peso', sysname: 'COP', symbol: '$' },
    { name: 'Czech Republic Koruna', sysname: 'CZK', symbol: 'Kč' },
    { name: 'Chinese Yuan', sysname: 'CNY', symbol: '¥' },
    { name: 'Costa Rican Colón', sysname: 'CRC', symbol: '₡' },
    { name: 'Congolese Franc', sysname: 'CDF', symbol: 'FC' },
    { name: 'Chinese Yuan (Offshore)', sysname: 'CNH', symbol: '¥' },
    { name: 'Cape Verdean Escudo', sysname: 'CVE', symbol: 'Esc' },
    { name: 'Djiboutian Franc', sysname: 'DJF', symbol: 'Fdj' },
    { name: 'Danish Krone', sysname: 'DKK', symbol: 'kr' },
    { name: 'Egyptian Pound', sysname: 'EGP', symbol: 'E£' },
    { name: 'Dominican Peso', sysname: 'DOP', symbol: 'RD$' },
    { name: 'Eritrean Nakfa', sysname: 'ERN', symbol: 'Nfk' },
    { name: 'Algerian Dinar', sysname: 'DZD', symbol: 'د.ج' },
    { name: 'Ethiopian Birr', sysname: 'ETB', symbol: 'Br' },
    { name: 'Guinean Franc', sysname: 'GNF', symbol: 'FG' },
    { name: 'Georgian Lari', sysname: 'GEL', symbol: '₾' },
    { name: 'Fijian Dollar', sysname: 'FJD', symbol: 'FJ$' },
    { name: 'Ghanaian Cedi', sysname: 'GHS', symbol: 'GH₵' },
    { name: 'Falkland Islands Pound', sysname: 'FKP', symbol: '£' },
    { name: 'British Pound Sterling (GBP)', sysname: 'GBP', symbol: '£' },
    { name: 'Guernsey Pound', sysname: 'GGP', symbol: '£' },
    { name: 'Guyanaese Dollar', sysname: 'GYD', symbol: 'GY$' },
    { name: 'Gambian Dalasi', sysname: 'GMD', symbol: 'D' },
    { name: 'Gibraltar Pound', sysname: 'GIP', symbol: '£' },
    { name: 'Guatemalan quetzal', sysname: 'GTQ', symbol: 'Q' },
    { name: 'Hong Kong Dollar', sysname: 'HKD', symbol: 'HK$' },
    { name: 'Croatian Kuna', sysname: 'HRK', symbol: 'kn' },
    { name: 'Honduran Lempira', sysname: 'HNL', symbol: 'L' },
    { name: 'Indian Rupee', sysname: 'INR', symbol: '₹' },
    { name: 'Hungarian Forint', sysname: 'HUF', symbol: 'Ft' },
    { name: 'Israeli New Sheqel', sysname: 'ILS', symbol: '₪' },
    { name: 'Indonesian Rupiah', sysname: 'IDR', symbol: 'Rp' },
    { name: 'Manx pound', sysname: 'IMP', symbol: '£' },
    { name: 'Haitian Gourde', sysname: 'HTG', symbol: 'G' },
    { name: 'Iraqi Dinar', sysname: 'IQD', symbol: 'ع.د' },
    { name: 'Iranian Rial', sysname: 'IRR', symbol: '﷼' },
    { name: 'Icelandic Króna', sysname: 'ISK', symbol: 'kr' },
    { name: 'Jamaican Dollar', sysname: 'JMD', symbol: 'J$' },
    { name: 'Jersey Pound', sysname: 'JEP', symbol: '£' },
    { name: 'Jordanian Dinar', sysname: 'JOD', symbol: 'JD' },
    { name: 'Comorian Franc', sysname: 'KMF', symbol: 'CF' },
    { name: 'Kyrgystani Som', sysname: 'KGS', symbol: 'сом' },
    { name: 'Cambodian Riel', sysname: 'KHR', symbol: '៛' },
    { name: 'Kenyan Shilling', sysname: 'KES', symbol: 'KSh' },
    { name: 'Japanese Yen', sysname: 'JPY', symbol: '¥' },
    { name: 'Sudanese Pound', sysname: 'SDG', symbol: 'SDG' },
    { name: 'Mauritian Rupee', sysname: 'MUR', symbol: '₨' },
    { name: 'Kazakhstani Tenge', sysname: 'KZT', symbol: '₸' },
    { name: 'Omani Rial', sysname: 'OMR', symbol: 'ر.ع.' },
    { name: 'Nepalese Rupee', sysname: 'NPR', symbol: '₨' },
    { name: 'South Korean Won', sysname: 'KRW', symbol: '₩' },
    { name: 'Mexican Peso', sysname: 'MXN', symbol: '$' },
    { name: 'Serbian Dinar', sysname: 'RSD', symbol: 'дин.' },
    { name: 'Philippine Peso', sysname: 'PHP', symbol: '₱' },
    { name: 'Moroccan Dirham', sysname: 'MAD', symbol: 'د.م.' },
    { name: 'Malaysian Ringgit', sysname: 'MYR', symbol: 'RM' },
    { name: 'Swedish Krona', sysname: 'SEK', symbol: 'kr' },
    { name: 'Moldovan Leu', sysname: 'MDL', symbol: 'L' },
    { name: 'Mauritanian Ouguiya', sysname: 'MRU', symbol: 'UM' },
    { name: 'Libyan Dinar', sysname: 'LYD', symbol: 'LD' },
    { name: 'Cayman Islands Dollar', sysname: 'KYD', symbol: 'CI$' },
    { name: 'Papua New Guinean Kina', sysname: 'PGK', symbol: 'K' },
    { name: 'Peruvian Nuevo Sol', sysname: 'PEN', symbol: 'S/' },
    { name: 'Polish Zloty', sysname: 'PLN', symbol: 'zł' },
    { name: 'Mozambican Metical', sysname: 'MZN', symbol: 'MT' },
    { name: 'Malawian Kwacha', sysname: 'MWK', symbol: 'MK' },
    { name: 'Nigerian Naira', sysname: 'NGN', symbol: '₦' },
    { name: 'Macanese Pataca', sysname: 'MOP', symbol: 'MOP$' },
    { name: 'Lesotho Loti', sysname: 'LSL', symbol: 'L' },
    { name: 'Nicaraguan Córdoba', sysname: 'NIO', symbol: 'C$' },
    { name: 'Mauritanian Ouguiya (pre-2018)', sysname: 'MRO', symbol: 'UM' },
    { name: 'Pakistani Rupee', sysname: 'PKR', symbol: '₨' },
    { name: 'Paraguayan Guarani', sysname: 'PYG', symbol: '₲' },
    { name: 'Liberian Dollar', sysname: 'LRD', symbol: 'L$' },
    { name: 'Malagasy Ariary', sysname: 'MGA', symbol: 'Ar' },
    { name: 'Solomon Islands Dollar', sysname: 'SBD', symbol: 'SI$' },
    { name: 'Lebanese Pound', sysname: 'LBP', symbol: 'L£' },
    { name: 'Kuwaiti Dinar', sysname: 'KWD', symbol: 'KD' },
    { name: 'Seychellois Rupee', sysname: 'SCR', symbol: '₨' },
    { name: 'New Zealand Dollar', sysname: 'NZD', symbol: 'NZ$' },
    { name: 'North Korean Won', sysname: 'KPW', symbol: '₩' },
    { name: 'Namibian Dollar', sysname: 'NAD', symbol: 'N$' },
    { name: 'Norwegian Krone', sysname: 'NOK', symbol: 'kr' },
    { name: 'Romanian Leu', sysname: 'RON', symbol: 'lei' },
    { name: 'Mongolian Tugrik', sysname: 'MNT', symbol: '₮' },
    { name: 'Sri LankanRupee', sysname: 'LKR', symbol: '₨' },
    { name: 'Macedonian Denar', sysname: 'MKD', symbol: 'ден' },
    { name: 'Rwandan Franc', sysname: 'RWF', symbol: 'FRw' },
    { name: 'Laotian Kip', sysname: 'LAK', symbol: '₭' },
    { name: 'Panamanian Balboa', sysname: 'PAB', symbol: 'B/.' },
    { name: 'Maldivian Rufiyaa', sysname: 'MVR', symbol: 'MVR' },
    { name: 'Saudi Riyal', sysname: 'SAR', symbol: 'SR' },
    { name: 'Myanma Kyat', sysname: 'MMK', symbol: 'K' },
    { name: 'Qatari Rial', sysname: 'QAR', symbol: 'QR' },
    { name: 'Singapore Dollar', sysname: 'SGD', symbol: 'S$' },
    { name: 'Saint Helena Pound', sysname: 'SHP', symbol: '£' },
    { name: 'Sierra Leonean Leone', sysname: 'SLL', symbol: 'Le' },
    { name: 'Salvadoran Colón', sysname: 'SVC', symbol: '₡' },
    { name: 'Syrian Pound', sysname: 'SYP', symbol: '£S' },
    { name: 'São Tomé and Príncipe Dobra', sysname: 'STN', symbol: 'Db' },
    { name: 'South Sudanese Pound', sysname: 'SSP', symbol: 'SS£' },
    { name: 'São Tomé and Príncipe Dobra (pre-2018)', sysname: 'STD', symbol: 'Db' },
    { name: 'Somali Shilling', sysname: 'SOS', symbol: 'Sh.So.' },
    { name: 'Surinamese Dollar', sysname: 'SRD', symbol: '$' },
    { name: 'Turkish Lira', sysname: 'TRY', symbol: '₺' },
    { name: 'Tunisian Dinar', sysname: 'TND', symbol: 'DT' },
    { name: "Tongan Pa'anga", sysname: 'TOP', symbol: 'T$' },
    { name: 'Thai Baht', sysname: 'THB', symbol: '฿' },
    { name: 'Trinidad and Tobago Dollar', sysname: 'TTD', symbol: 'TT$' },
    { name: 'Ugandan Shilling', sysname: 'UGX', symbol: 'USh' },
    { name: 'Tanzanian Shilling', sysname: 'TZS', symbol: 'TSh' },
    { name: 'Tajikistani Somoni', sysname: 'TJS', symbol: 'SM' },
    { name: 'Ukrainian Hryvnia', sysname: 'UAH', symbol: '₴' },
    { name: 'Swazi Lilangeni', sysname: 'SZL', symbol: 'E' },
    { name: 'Turkmenistani Manat', sysname: 'TMT', symbol: 'T' },
    { name: 'New Taiwan Dollar', sysname: 'TWD', symbol: 'NT$' },
    { name: 'Uzbekistan Som', sysname: 'UZS', symbol: 'UZS' },
    { name: 'Palladium Ounce', sysname: 'XPD', symbol: 'Pd' },
    { name: 'Zambian Kwacha', sysname: 'ZMW', symbol: 'ZK' },
    { name: 'Venezuelan Bolívar Soberano', sysname: 'VES', symbol: 'Bs.' },
    { name: 'CFA Franc BEAC', sysname: 'XAF', symbol: 'FCFA' },
    { name: 'Special Drawing Rights', sysname: 'XDR', symbol: 'SDR' },
    { name: 'Platinum Ounce', sysname: 'XPT', symbol: 'Pt' },
    { name: 'Uruguayan Peso', sysname: 'UYU', symbol: '$U' },
    { name: 'Vietnamese Dong', sysname: 'VND', symbol: '₫' },
    { name: 'CFA Franc BCEAO', sysname: 'XOF', symbol: 'CFA' },
    { name: 'Samoan Tala', sysname: 'WST', symbol: 'WS$' },
    { name: 'Venezuelan Bolívar Fuerte (Old)', sysname: 'VEF', symbol: 'Bs.F.' },
    { name: 'Vanuatu Vatu', sysname: 'VUV', symbol: 'VT' },
    { name: 'Gold Ounce', sysname: 'XAU', symbol: 'Au' },
    { name: 'CFP Franc', sysname: 'XPF', symbol: 'CFP' },
    { name: 'East Caribbean Dollar', sysname: 'XCD', symbol: 'EC$' },
    { name: 'Silver Ounce', sysname: 'XAG', symbol: 'Ag' },
    { name: 'South African Rand', sysname: 'ZAR', symbol: 'R' },
    { name: 'Yemeni Rial', sysname: 'YER', symbol: 'YER' },
    { name: 'Zimbabwean Dollar', sysname: 'ZWL', symbol: 'Z$' }
];

const initCurrencies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Currency.collection.drop();

        for (let index = 0; index < currenciesObj.length; index++) {
            const item = currenciesObj[index];
            let { name, sysname, symbol } = item;

            const currency = new Currency({ name, sysname, symbol });

            await currency.save();
        }

        sendBackHandler(res, 'currency', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, sysname, image, symbol } = req.body;

        const currency = new Currency({ name, sysname, image, symbol });

        const data = await currency.save();

        sendBackHandler(res, 'currency', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const exchangeCurrency = async (req: Request, res: Response, next: NextFunction) => {
    let { from, to, amount } = req.body;

    if (!from || !to || !amount) return errorHandler(res, { message: 'wrong values' }, 422);

    const firstCurrency = await Currency.findById(from).exec();
    const secondCurrency = await Currency.findById(to).exec();

    if (!firstCurrency || !secondCurrency) return errorHandler(res, { message: 'cant find currency object' }, 422);

    // const exchangeRate = await currencyExchange(firstCurrency.sysname, secondCurrency.sysname);
    // const converted = amount * exchangeRate['Realtime Currency Exchange Rate']['5. Exchange Rate'];

    const exchangeRate = await currencyExchangeCC(firstCurrency.sysname, secondCurrency.sysname);
    const converted = amount * exchangeRate.info.rate;

    sendBackHandler(res, 'currency', converted);
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const { filters } = req.body;

    let additionalFilters: any = {};

    if (typeof filters?.query === 'string' && filters?.query?.length > 0) {
        const regex = new RegExp(filters?.query, 'i');

        additionalFilters = { $or: [{ name: regex }, { sysname: regex }, { symbol: regex }] };
    }

    const data = await Currency.find(additionalFilters).exec();
    sendBackHandler(res, 'currency', data);
};

export default { getAll, create, exchangeCurrency, initCurrencies };
