import { Types } from 'mongoose';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';

export interface IBondRequest {
    user: Types.ObjectId;
    offer: string;
    want: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    description?: string;
    radius?: number;
    status: (typeof ENUM_BOND_REQUEST_STATUS)[keyof typeof ENUM_BOND_REQUEST_STATUS];
    isLinked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isPause: boolean;
    offerVector: number[];
    wantVector: number[];
}
