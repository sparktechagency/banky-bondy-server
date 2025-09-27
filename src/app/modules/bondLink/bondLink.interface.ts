import { Types } from 'mongoose';
import { ENUM_BOND_LINK_STATUS } from './bondLink.enum';

export interface IBondLink {
    id: Types.ObjectId;
    name: string;
    participants: Types.ObjectId[];
    requestedBonds: Types.ObjectId[];
    status: (typeof ENUM_BOND_LINK_STATUS)[keyof typeof ENUM_BOND_LINK_STATUS];
    markAsCompletedBy: Types.ObjectId[];
    createdAt: Date;
    updated: Date;
}
