import { Types } from 'mongoose';

export interface IBondRating {
    rated: Types.ObjectId;
    ratedBy: Types.ObjectId;
    rating: number;
    bondLink: Types.ObjectId;
    want: string;
    offer: string;
}
