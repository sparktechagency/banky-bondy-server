import { Schema, model } from 'mongoose';
import { ITopic } from './topic.interface';

const TopicSchema = new Schema<ITopic>(
    {
        topic_image: {
            type: String,
            required: true,
        },
        name: { type: String, required: true, unique: true },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Topic = model<ITopic>('Topic', TopicSchema);

export { Topic };
