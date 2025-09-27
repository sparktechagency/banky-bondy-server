import { ObjectId } from 'mongodb';

export interface IProjectImage {
    id: ObjectId;
    addedBy: ObjectId;
    project: ObjectId;
    image_url: string;
    createdAt: Date;
    updatedAt: Date;
}
