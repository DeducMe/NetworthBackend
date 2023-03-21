import { Document, Schema } from 'mongoose';

export default interface Profile extends Document {
    name: Schema.Types.String;
    avatar: Schema.Types.String;
    userId: string;
}
