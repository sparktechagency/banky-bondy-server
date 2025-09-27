import { Types } from 'mongoose';
import { ENUM_PROJECT_MUMBER_TYPE } from './projectMumber.enum';

export interface IProjectMember {
    user: Types.ObjectId;
    project: Types.ObjectId;
    type: (typeof ENUM_PROJECT_MUMBER_TYPE)[keyof typeof ENUM_PROJECT_MUMBER_TYPE];
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}
