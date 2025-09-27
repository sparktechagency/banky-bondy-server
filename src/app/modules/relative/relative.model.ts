import { Schema, model } from 'mongoose';
import { IRelative } from './relative.interface';
import { ENUM_FAMILY_SIDE } from './relative.enum';

const relativeSchema = new Schema<IRelative>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        relative: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        relation: { type: String, required: true, trim: true },
        familySide: {
            type: String,
            enum: Object.values(ENUM_FAMILY_SIDE),
        },
    },
    { timestamps: true }
);

const Relative = model<IRelative>('Relative', relativeSchema);

export default Relative;
