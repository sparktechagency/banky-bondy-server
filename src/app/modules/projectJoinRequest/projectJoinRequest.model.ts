import { Schema, model } from 'mongoose';
import { IProjectJoinRequest } from './projectJoinRequest.interface';
import { ENUM_PROJECT_JOIN_REQEST_STATUS } from './projectJoinRequest.enum';

const projectJoinRequestSchema = new Schema<IProjectJoinRequest>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_PROJECT_JOIN_REQEST_STATUS),
            default: ENUM_PROJECT_JOIN_REQEST_STATUS.Pending,
        },
    },
    { timestamps: true }
);

const ProjectJoinRequest = model<IProjectJoinRequest>(
    'ProjectJoinRequest',
    projectJoinRequestSchema
);

export default ProjectJoinRequest;
