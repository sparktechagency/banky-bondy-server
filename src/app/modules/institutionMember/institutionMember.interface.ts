import { Types } from 'mongoose';
import { ENUM_GROUP } from './institutionMember.enum';

export interface IInstitutionMember {
    group: (typeof ENUM_GROUP)[keyof typeof ENUM_GROUP];
    designation: string;
    user: Types.ObjectId;
    institution: Types.ObjectId;
}
