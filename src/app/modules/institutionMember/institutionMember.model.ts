import { model, Schema } from 'mongoose';
import { IInstitutionMember } from './institutionMember.interface';
import { ENUM_GROUP } from './institutionMember.enum';

const institutionMemberSchema = new Schema<IInstitutionMember>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'NormalUser',
        },
        institution: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Institution',
        },
        designation: { type: String, required: true },
        group: {
            type: String,
            enum: Object.values(ENUM_GROUP),
            required: true,
        },
    },
    { timestamps: true }
);

const InstitutionMember = model<IInstitutionMember>(
    'InstitutionMember',
    institutionMemberSchema
);
export default InstitutionMember;
