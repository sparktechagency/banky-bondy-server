import { model, Schema } from 'mongoose';
import { ISuperAdmin } from './superAdmin.interface';

const superAdminSchema = new Schema<ISuperAdmin>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
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
        profile_image: {
            type: String,
            default: '',
        },
        contact: {
            type: String,
            default: '',
        },
        address: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);
const SuperAdmin = model<ISuperAdmin>('SuperAdmin', superAdminSchema);

export default SuperAdmin;
