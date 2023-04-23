import { Document, Schema } from 'mongoose';

export default interface Currency extends Document {
    sysname: string;
    image: string;
    symbol: string;
    name: string;
}
