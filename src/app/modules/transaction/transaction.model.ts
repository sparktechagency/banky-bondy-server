import { Schema, model, Types } from 'mongoose';
import { ENUM_TRANSACTION_TYPE } from '../../utilities/enum';

const TransactionSchema = new Schema(
    {
        user: {
            type: Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(ENUM_TRANSACTION_TYPE),
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        transactionId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = model('Transaction', TransactionSchema);

export default Transaction;
