import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';
import ICurrency from './currencyInterface';

const CurrencySchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        sysname: { type: Schema.Types.String, required: false },
        image: { type: Schema.Types.String, required: false },
        symbol: { type: Schema.Types.String, required: false }
    },
    {
        timestamps: false
    }
);

CurrencySchema.post<ICurrency>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ICurrency>('Currency', CurrencySchema);
