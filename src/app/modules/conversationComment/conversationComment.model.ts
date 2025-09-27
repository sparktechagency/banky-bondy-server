import { Schema, model } from 'mongoose';
import { IConversationComment } from './conversationComment.interface';

const conversationCommentSchema = new Schema<IConversationComment>(
    {
        institutionConversation: {
            type: Schema.Types.ObjectId,
            ref: 'InstitutionConversation',
            required: true,
        },
        comment: { type: String, required: true },
        likers: [{ type: Schema.Types.ObjectId, ref: 'NormalUser' }],
    },
    { timestamps: true }
);

const ConversationComment = model<IConversationComment>(
    'ConversationComment',
    conversationCommentSchema
);

export default ConversationComment;
