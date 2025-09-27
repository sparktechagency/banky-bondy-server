import { Types } from 'mongoose';

export interface IPlaylist {
    user: Types.ObjectId;
    name: string;
    description: string;
    tags: string[];
    cover_image: string;
    audios: Types.ObjectId[];
}
