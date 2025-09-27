import { Schema, model } from 'mongoose';
import { IDonate } from './donate.interface';
import { ENUM_DONATE_STATUS } from './donate.enum';

const DonateSchema = new Schema<IDonate>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_DONATE_STATUS),
            default: ENUM_DONATE_STATUS.Unpaid,
        },
        amount: { type: Number, required: true },
    },
    { timestamps: true }
);

export const Donate = model<IDonate>('Donate', DonateSchema);
