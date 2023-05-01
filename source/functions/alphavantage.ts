import { ALPHA_VANTAGE_KEY } from '../config/config';

export async function getStock(stock: string) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${ALPHA_VANTAGE_KEY}`;

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

export async function findStockHelper(stock: string) {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stock}&apikey=demo${ALPHA_VANTAGE_KEY}`;

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

export async function getCoin(crypto: string, currency: string) {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${crypto}&to_currency=${currency}&apikey=${ALPHA_VANTAGE_KEY}`;

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
