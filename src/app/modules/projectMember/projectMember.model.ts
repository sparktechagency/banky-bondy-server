import { Schema, model } from 'mongoose';
import { IProjectMember } from './projectMember.interface';
import { ENUM_PROJECT_MUMBER_TYPE } from './projectMumber.enum';

const projectMemberSchema = new Schema<IProjectMember>(
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
        type: {
            type: String,
            enum: Object.values(ENUM_PROJECT_MUMBER_TYPE),
            default: ENUM_PROJECT_MUMBER_TYPE.Consumer,
        },
        role: { type: String, default: 'Consumer' },
    },
    { timestamps: true }
);

const ProjectMember = model<IProjectMember>(
    'ProjectMember',
    projectMemberSchema
);

export default ProjectMember;
