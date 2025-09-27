import { Types } from 'mongoose';
import { ENUM_JOIN_CONTROLL, ENUM_PROJECT_STATUS } from './project.enum';

export interface IProject {
    name: string;
    description: string;
    cover_image?: string;
    isPublic: boolean;
    joinControll: (typeof ENUM_JOIN_CONTROLL)[keyof typeof ENUM_JOIN_CONTROLL];
    owner: Types.ObjectId;
    status: (typeof ENUM_PROJECT_STATUS)[keyof typeof ENUM_PROJECT_STATUS];
    createdAt?: Date;
    updatedAt?: Date;
}
