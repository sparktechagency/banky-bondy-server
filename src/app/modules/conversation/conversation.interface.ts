import { ObjectId } from 'mongodb';
import { ENUM_CONVERSATION_TYPE } from './conversation.enum';

export interface IConversation {
    id: ObjectId;
    participants: ObjectId[];
    lastMessage: ObjectId;
    type: (typeof ENUM_CONVERSATION_TYPE)[keyof typeof ENUM_CONVERSATION_TYPE];
    institution: ObjectId | null;
    project: ObjectId | null;
    bondLink: ObjectId | null;
    chatGroup: ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
