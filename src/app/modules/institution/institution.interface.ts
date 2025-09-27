import { Types } from 'mongoose';

export interface IInstitution {
    name: string;
    cover_image: string;
    description: string;
    groupOneName: string;
    groupTwoName: string;
    facebookLink: string;
    instagramLink: string;
    creator: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
