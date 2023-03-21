import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';
import IAssets from './assetsInterface';

const AssetsSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        categories: [{ type: Schema.Types.ObjectId, ref: 'Categories', required: false }],
        price: { type: Schema.Types.Number, required: false },
        currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: false },
        image: { type: Schema.Types.String, required: false },
        additional: [{ type: Schema.Types.ObjectId, required: false, ref: 'AssetsAdditionalTypesItem' }]
    },
    {
        timestamps: true
    }
);

AssetsSchema.post<IAssets>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IAssets>('Assets', AssetsSchema);
