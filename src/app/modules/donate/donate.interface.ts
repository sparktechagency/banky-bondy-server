import { Types } from 'mongoose';
import { ENUM_DONATE_STATUS } from './donate.enum';

export interface IDonate {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    amount: number;
    status: (typeof ENUM_DONATE_STATUS)[keyof typeof ENUM_DONATE_STATUS];
    createdAt?: Date;
    updatedAt?: Date;
}
