import { Types } from 'mongoose';

export interface ISuperAdmin {
    user: Types.ObjectId;
    name: string;
    email: string;
    profile_image: string;
    contact: string;
    address: string;
}
