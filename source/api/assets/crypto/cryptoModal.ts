import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';

export interface ICrypto extends Document {
    name: string;
    sysname: string;
    marketCapRank?: number;
    thumb?: string;
    large?: string;
    symbol?: string;
}

const CryptoSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        sysname: { type: Schema.Types.String, required: true },
        thumb: { type: Schema.Types.String, required: false },
        large: { type: Schema.Types.String, required: false },
        marketCapRank: { type: Schema.Types.Number, required: false },
        symbol: { type: Schema.Types.String, required: false }
    },
    {
        timestamps: false
    }
);

CryptoSchema.post<ICrypto>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ICrypto>('Crypto', CryptoSchema);
