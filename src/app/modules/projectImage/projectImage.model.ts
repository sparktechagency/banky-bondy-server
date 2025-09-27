import { Schema, model } from 'mongoose';
import { IProjectImage } from './projectImage.interface';

const projectImageSchema = new Schema<IProjectImage>({
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'NormalUser',
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const ProjectImage = model<IProjectImage>('ProjectImage', projectImageSchema);

export default ProjectImage;
