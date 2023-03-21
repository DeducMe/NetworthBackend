import { Document, Schema } from 'mongoose';

export default interface AssetsAdditionalTypes extends Document {
    keys: string[];
    name: string;
}
