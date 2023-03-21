import { Document } from 'mongoose';

export default interface User extends Document {
    login: string;
    password: string;
}
