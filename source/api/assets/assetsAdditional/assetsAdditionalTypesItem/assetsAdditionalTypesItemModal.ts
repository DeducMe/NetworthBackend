import mongoose, { Schema } from 'mongoose';
import logging from '../../../../config/logging';
import IAssetsAdditionalTypesItem from './assetsAdditionalTypesItemInterface';

const AssetsAdditionalTypesItemSchema: Schema = new Schema(
    {
        type: { type: Schema.Types.ObjectId, ref: 'AssetsAdditionalTypes', required: true },
        value: { type: Schema.Types.Mixed, required: true }
    },
    {
        timestamps: true
    }
);

AssetsAdditionalTypesItemSchema.post<IAssetsAdditionalTypesItem>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IAssetsAdditionalTypesItem>('AssetsAdditionalTypesItem', AssetsAdditionalTypesItemSchema);
