import { Types } from 'mongoose';
import { ENUM_TRANSACTION_TYPE } from '../../utilities/enum';

export interface ITransaction {
    user: Types.ObjectId;
    type: (typeof ENUM_TRANSACTION_TYPE)[keyof typeof ENUM_TRANSACTION_TYPE];
    amount: number;
    transactionId: string;
}
