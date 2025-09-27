import { Schema, model } from 'mongoose';
import { IAdmin } from './admin.interface';

const adminSchema = new Schema<IAdmin>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            default: '',
        },
        profile_image: {
            type: String,
            default: '',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Admin = model<IAdmin>('Admin', adminSchema);

export default Admin;
