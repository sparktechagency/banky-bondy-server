import { Types } from 'mongoose';

export interface IAudio {
    user: Types.ObjectId;
    audioTopic: Types.ObjectId;
    title: string;
    audio_url: string;
    description: string;
    cover_image: string;
    tags: string[];
    totalPlay: number;
    duration: number;
    totalRating: number;
    ratingCount: number;
    isBlocked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAudioRating {
    user: Types.ObjectId;
    audio: Types.ObjectId;
    rating: number;
}
