//API requests made by a throttled user or app will fail. All API requests are subject to rate limits. Real time rate limit usage statistics are described in headers that are included with most API responses once enough calls have been made to an endpoint.

export async function currencyExchangeWithDateCC(date: string, from: string, to: string) {
    const url = `https://api.exchangerate.host/${date}?base=${from}&symbols=${to}`;
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

export async function currencyExchangeCC(from: string, to: string) {
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}`;
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

export async function btcToFiat(to: string) {
    return await currencyExchangeCC('BTC', to);
}

export async function symbolsCC() {
    const url = `https://api.exchangerate.host/symbols`;
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
