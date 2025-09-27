/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { IAudio, IAudioRating } from './audio.interface';

const audioSchema = new Schema<IAudio>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        audioTopic: {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            required: true,
        },
        audio_url: {
            type: String,
            required: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String },
        cover_image: { type: String, required: true },
        tags: { type: [String], default: [] },
        totalPlay: { type: Number, default: 0 },
        totalRating: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        duration: { type: Number, required: true },
    },
    { timestamps: true }
);

const audioRatingSchema = new Schema<IAudioRating>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        audio: {
            type: Schema.Types.ObjectId,
            ref: 'Audio',
            required: true,
        },
        rating: {
            type: Number,
            max: 5,
            required: true,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

const Audio = model<IAudio>('Audio', audioSchema);
export const AudioRating = model<IAudioRating>(
    'AudioRating',
    audioRatingSchema
);
export default Audio;
