import { Schema, model } from 'mongoose';
import { IBond } from './bond.interface';

const BondSchema = new Schema<IBond>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        offer: { type: String, required: true },
        want: { type: String, required: true },
        tag: { type: String },
    },
    { timestamps: true }
);

const Bond = model<IBond>('Bond', BondSchema);
export default Bond;
