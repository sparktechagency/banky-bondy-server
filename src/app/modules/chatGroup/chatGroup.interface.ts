import { Types } from 'mongoose';

export interface IChatGroup {
    name: string;
    participants: [Types.ObjectId];
    creator: Types.ObjectId;
    image?: string;
}
