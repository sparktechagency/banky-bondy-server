import { Types } from 'mongoose';

export interface IRecommendedUser {
    recommendBy: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    skill: Types.ObjectId;
    recommendByUserId: Types.ObjectId;
}
