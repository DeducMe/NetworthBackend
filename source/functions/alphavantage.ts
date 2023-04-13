import { ALPHA_VINTAGE_KEY } from '../config/config';

export async function currencyExchange(from: string, to: string) {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${ALPHA_VINTAGE_KEY}`;

    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
    });

    return await resp;
}

export async function getStock(stock: string) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=5min&apikey=${ALPHA_VINTAGE_KEY}`;

    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
    });

    return await resp;
}
