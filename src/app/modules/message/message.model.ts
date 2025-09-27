import { Schema, model } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
    {
        text: {
            type: String,
            // required: true,
            default: '',
        },
        imageUrl: {
            type: [String],
            default: [],
        },
        videoUrl: {
            type: [String],
            default: [],
        },
        pdfUrl: {
            type: [String],
            default: [],
        },
        msgByUserId: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        seenBy: {
            type: [Schema.Types.ObjectId],
            ref: 'NormalUser',
            default: [],
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Message = model<IMessage>('Message', messageSchema);

export default Message;
