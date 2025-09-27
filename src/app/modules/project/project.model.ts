import { Schema, model } from 'mongoose';
import { IProject } from './project.interface';
import { ENUM_JOIN_CONTROLL, ENUM_PROJECT_STATUS } from './project.enum';

const projectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        cover_image: { type: String, required: true },
        isPublic: { type: Boolean, required: true },
        joinControll: {
            type: String,
            enum: Object.values(ENUM_JOIN_CONTROLL),
            default: ENUM_JOIN_CONTROLL.Public,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_PROJECT_STATUS),
            default: ENUM_PROJECT_STATUS.Ongoing,
        },
    },
    {
        timestamps: true,
    }
);

const Project = model<IProject>('Project', projectSchema);

export default Project;
