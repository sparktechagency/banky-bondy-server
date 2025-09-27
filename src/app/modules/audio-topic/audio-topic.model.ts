import { model, Schema } from 'mongoose';
import { IAudioTopic } from './audio-topic.interface';

const AudioTopicSchema: Schema = new Schema<IAudioTopic>(
    {
        name: { type: String, required: true },
        topic_image: { type: String, required: true },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const AudioTopic = model<IAudioTopic>('AudioTopic', AudioTopicSchema);

export default AudioTopic;
