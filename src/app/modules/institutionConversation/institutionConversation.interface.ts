import { Types } from 'mongoose';

export interface IInstitutionConversation {
    user: Types.ObjectId;
    institution: Types.ObjectId;
    name: string;
    isPublic: boolean;
    ussers: Types.ObjectId[];
    likers: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
