import mongoose, { Schema, Document } from 'mongoose';
import logging from '../../../config/logging';
import Assets from '../assets/assetsInterface';

export interface IAssetsChangeLog extends Document {
    name: string;
    asset: Schema.Types.ObjectId & Assets;
    type: string;
    price: number;
    amount: number;
}

const AssetsChangeLogSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        asset: { type: Schema.Types.ObjectId, ref: 'Assets', required: false },
        type: { type: Schema.Types.String, required: true },
        price: { type: Schema.Types.Number, required: true },
        amount: { type: Schema.Types.Number, required: true },
        userProfileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true }
    },
    {
        timestamps: true
    }
);

AssetsChangeLogSchema.post<IAssetsChangeLog>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IAssetsChangeLog>('AssetsChangeLog', AssetsChangeLogSchema);
