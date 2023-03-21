import { Document, Schema } from 'mongoose';

export default interface AssetsAdditionalTypesItem extends Document {
    type: Schema.Types.ObjectId;
    value: any;
}
