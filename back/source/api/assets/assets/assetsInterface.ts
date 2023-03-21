import { Document, Schema } from 'mongoose';

export default interface Assets extends Document {
    name: string;
    categories?: Schema.Types.ObjectId[];
    price: number;
    image: string;
    additional?: Schema.Types.ObjectId[];
}
