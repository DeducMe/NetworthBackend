// 250,000 calls
// 100,000 month

export async function currencyExchangeCC(from: string, to: string) {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`;
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
