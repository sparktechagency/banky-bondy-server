import { Types } from 'mongoose';

export interface IBookmark {
    audio: Types.ObjectId;
    user: Types.ObjectId;
}
