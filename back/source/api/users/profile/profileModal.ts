import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';
import Profile from './profileInterface';

const ProfileSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        name: { type: Schema.Types.String, required: false },
        avatar: { type: Schema.Types.String, required: false }
    },
    {
        timestamps: false
    }
);
ProfileSchema.post<Profile>('save', function () {
    logging.info('Mongo', 'Checkout the Profile we just saved: ', this);
});

export default mongoose.model<Profile>('Profile', ProfileSchema);
