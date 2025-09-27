import { model, Schema } from 'mongoose';
import { IBanner } from './banner.interface';

const bannerSchema = new Schema<IBanner>(
    {
        image: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Banner = model<IBanner>('Banner', bannerSchema);
export default Banner;
