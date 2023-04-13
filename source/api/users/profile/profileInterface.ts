import { Document, Schema } from 'mongoose';
import Currency from '../../assets/currency/currencyInterface';

export default interface Profile extends Document {
    currencySet: Schema.Types.ObjectId & Currency;
    name: Schema.Types.String;
    avatar: Schema.Types.String;
    userId: string;
}
