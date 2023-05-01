// 10-30 req/min

type CryptoSymbols = {
    id: string;
    symbol: string;
    name: string;
};

type CryptoSymbolsExtended = {
    id: string;
    name: string;
    symbol: string;
    api_symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
};

export async function searchSymbols(query: string): Promise<{ coins: CryptoSymbolsExtended[] }> {
    const url = `https://api.coingecko.com/api/v3/search?query=${query}`;
    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        return response.json();
    });

    return await resp;
}

export async function symbolsCoinGecko(): Promise<{ crypto: CryptoSymbols[] }> {
    const url = `https://api.coingecko.com/api/v3/coins/list`;
    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        return response.json();
    });

    return await resp;
}

export async function symbolsCoinGeckoRange(id: string, from: number, to: number): Promise<any> {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        return response.json();
    });

    return await resp;
}

export async function symbolsCoinGeckoById(id: string): Promise<any> {
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        return response.json();
    });

    return await resp;
}

export async function coinToBtc({ idsFrom }: { idsFrom: string[] }) {
    const idsFromConverted = idsFrom.join('%2C');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsFromConverted}&vs_currencies=btc&include_market_cap=true&include_last_updated_at=true`;

    const resp = await fetch(url, {
        method: 'GET',
        headers: {}
    }).then((response) => {
        return response.json();
    });

    return await resp;
}

export async function coinToStable({ idsFrom, idsTo }: { idsFrom: string[]; idsTo: string[] }) {
    const idsFromConverted = idsFrom.join('%2C');
    const idsToConverted = idsTo.join('%2C');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsFromConverted}&vs_currencies=${idsToConverted}&include_24hr_change=true`;

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
