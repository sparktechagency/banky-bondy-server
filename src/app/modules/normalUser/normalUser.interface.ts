/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { ENUM_GENDER } from '../user/user.enum';

export interface INormalUser {
    user: Types.ObjectId;
    // username: string;
    name: string;
    email: string;
    phone: string;
    profile_image: string;
    cover_image: string;
    gender: (typeof ENUM_GENDER)[keyof typeof ENUM_GENDER];
    dateOfBirth: Date;
    address: string;
    bio: string;
    skills: [Types.ObjectId];
    socialLinks: string[];
}
