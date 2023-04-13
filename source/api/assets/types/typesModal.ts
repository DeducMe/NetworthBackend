import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';

export interface ITypes extends Document {
    name: string;
    sysname: string;
}

const TypesSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        sysname: { type: Schema.Types.String, required: true }
    },
    {
        timestamps: true
    }
);

TypesSchema.post<ITypes>('save', function () {
    logging.info('Mongo', 'Checkout the Types we just saved: ', this);
});

export default mongoose.model<ITypes>('Types', TypesSchema);
