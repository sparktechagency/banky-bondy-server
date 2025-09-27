import { Schema, model } from 'mongoose';
import { IInstitution } from './institution.interface';
import { ENUM_GROUP } from '../institutionMember/institutionMember.enum';

const institutionSchema = new Schema<IInstitution>(
    {
        name: { type: String, required: true },
        cover_image: { type: String, required: true },
        description: { type: String, required: true },
        groupOneName: { type: String, default: ENUM_GROUP.A },
        groupTwoName: { type: String, default: ENUM_GROUP.B },
        facebookLink: { type: String },
        instagramLink: { type: String },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Institution = model<IInstitution>('Institution', institutionSchema);

export default Institution;
