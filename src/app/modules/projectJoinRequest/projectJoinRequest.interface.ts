import { Types } from 'mongoose';
import { ENUM_PROJECT_JOIN_REQEST_STATUS } from './projectJoinRequest.enum';

export interface IProjectJoinRequest {
    user: Types.ObjectId;
    project: Types.ObjectId;
    status: (typeof ENUM_PROJECT_JOIN_REQEST_STATUS)[keyof typeof ENUM_PROJECT_JOIN_REQEST_STATUS];
    createdAt?: Date;
    updatedAt?: Date;
}
