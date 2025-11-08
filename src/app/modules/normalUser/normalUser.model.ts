import { model, Schema } from 'mongoose';
import { ENUM_GENDER } from '../user/user.enum';
import { ENUM_SUBSCRIPTION_TYPE } from './normalUser.enum';
import { INormalUser } from './normalUser.interface';

const NormalUserSchema = new Schema<INormalUser>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        // username: {
        //     type: String,
        //     required: true,
        // },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
        },
        profile_image: {
            type: String,
            default: '',
        },
        cover_image: {
            type: String,
            default: '',
        },
        gender: {
            type: String,
            enum: Object.values(ENUM_GENDER),
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
        },
        bio: {
            type: String,
        },
        skills: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Skill',
            },
        ],
        socialLinks: {
            type: [String],
            default: [],
        },
        subscriptionType: {
            type: String,
            enum: Object.values(ENUM_SUBSCRIPTION_TYPE),
            default: ENUM_SUBSCRIPTION_TYPE.Free,
        },
        bondLimit: {
            type: Number,
            default: 10,
        },
    },
    {
        timestamps: true,
    }
);
const NormalUser = model<INormalUser>('NormalUser', NormalUserSchema);

export default NormalUser;
