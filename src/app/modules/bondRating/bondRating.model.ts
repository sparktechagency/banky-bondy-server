import { model, Schema } from 'mongoose';
import { IBondRating } from './bondRating.interface';

const bondRatingSchema = new Schema<IBondRating>(
    {
        rated: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'NormalUser',
        },
        ratedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'NormalUser',
        },
        bondLink: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'BondLink',
        },
        rating: {
            type: Number,
            required: true,
            max: 5,
            min: 1,
        },
        want: {
            type: String,
            required: true,
        },
        offer: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const BondRating = model<IBondRating>('BondRating', bondRatingSchema);
export default BondRating;
