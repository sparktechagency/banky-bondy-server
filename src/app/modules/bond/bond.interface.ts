import { Types } from 'mongoose';

export interface IBond {
    user: Types.ObjectId;
    offer: string;
    want: string;
    tag: string;
    createdAt?: Date;
    updatedAt?: Date;
}
