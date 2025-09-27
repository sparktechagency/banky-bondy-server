import { Schema, model } from 'mongoose';
import { IProjectDocument } from './projectDocument.interface';

const projectDocumentSchema = new Schema<IProjectDocument>({
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
    document_url: {
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

const ProjectDocument = model<IProjectDocument>(
    'ProjectDocument',
    projectDocumentSchema
);

export default ProjectDocument;
