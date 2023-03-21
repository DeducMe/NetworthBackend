import mongoose, { Schema } from 'mongoose';
import logging from '../../../../config/logging';
import IAssetsAdditionalTypes from './assetsAdditionalTypesInterface';

const AssetsAdditionalTypesSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        keys: [{ type: Schema.Types.String, required: false }]
    },
    {
        timestamps: true
    }
);

AssetsAdditionalTypesSchema.post<IAssetsAdditionalTypes>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IAssetsAdditionalTypes>('AssetsAdditionalTypes', AssetsAdditionalTypesSchema);
