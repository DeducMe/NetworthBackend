import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';
import ICategories from './categoriesInterface';

const CategoriesSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        image: { type: Schema.Types.String, required: false }
    },
    {
        timestamps: false
    }
);

CategoriesSchema.post<ICategories>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ICategories>('Categories', CategoriesSchema);
