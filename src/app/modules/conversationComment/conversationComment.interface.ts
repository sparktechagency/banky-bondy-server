import { Types } from 'mongoose';

export interface IConversationComment {
    institutionConversation: Types.ObjectId;
    comment: string;
    likers: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
