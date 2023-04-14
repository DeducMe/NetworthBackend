import { Document, Schema } from 'mongoose';
import Currency from '../currency/currencyInterface';

export default interface Assets extends Document {
    currency: Schema.Types.ObjectId & Currency;
    name: string;
    categories?: Schema.Types.ObjectId[];
    price: number;
    amount: number;
    image: string;
    additional?: Schema.Types.ObjectId[];
}
