import { Types } from 'mongoose';

export interface IFeedback {
    user: Types.ObjectId;
    name: string;
    description: string;
    replyMessage: string;
}
