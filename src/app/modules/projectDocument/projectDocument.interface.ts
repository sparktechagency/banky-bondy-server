import { ObjectId } from 'mongodb';

export interface IProjectDocument {
    id: ObjectId;
    addedBy: ObjectId;
    project: ObjectId;
    document_url: string;
    createdAt: Date;
    updatedAt: Date;
}
