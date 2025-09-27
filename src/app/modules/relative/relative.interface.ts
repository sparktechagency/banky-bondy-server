import { Types } from 'mongoose';
import { ENUM_FAMILY_SIDE } from './relative.enum';

export interface IRelative {
    user: Types.ObjectId;
    relative: Types.ObjectId;
    relation: string;
    familySide: (typeof ENUM_FAMILY_SIDE)[keyof typeof ENUM_FAMILY_SIDE];
}
