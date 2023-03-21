import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';
import User from './userInterface';

const UserSchema: Schema = new Schema(
    {
        login: { type: String, required: [true, 'Enter a login.'], unique: [true, 'That username is taken.'] },
        password: { type: String, required: [true, 'Enter a password.'], minLength: [4, 'Password should be at least four characters'] }
    },
    {
        strict: true,
        versionKey: false,
        timestamps: false,
        id: false,
        skipVersioning: true,
        toJSON: { virtuals: true }
    }
);
UserSchema.post<User>('save', function () {
    logging.info('Mongo', 'Checkout the user we just saved: ', this);
});

export default mongoose.model<User>('User', UserSchema);
