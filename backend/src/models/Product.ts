import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    initialDescription: string;
    details: {
        question: string;
        answer: string;
        transparencyScore: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
    initialDescription: { type: String, required: true },
    details: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
            transparencyScore: { type: Number, required: true },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Explicitly define the collection name here if you don't want the default 'products'
export default mongoose.model<IProduct>('Product', ProductSchema, 'product_details');
