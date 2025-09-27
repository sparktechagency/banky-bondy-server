import { Schema, model } from 'mongoose';
import { IInstitutionConversation } from './institutionConversation.interface';

const institutionConversationSchema = new Schema<IInstitutionConversation>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        institution: {
            type: Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },
        name: { type: String, required: true },
        isPublic: { type: Boolean, default: true },
        ussers: [{ type: Schema.Types.ObjectId, ref: 'NormalUser' }],
        likers: [{ type: Schema.Types.ObjectId, ref: 'NormalUser' }],
    },
    {
        timestamps: true,
    }
);

const InstitutionConversation = model<IInstitutionConversation>(
    'InstitutionConversation',
    institutionConversationSchema
);

export default InstitutionConversation;
