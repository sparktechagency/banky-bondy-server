import httpStatus from 'http-status';
import AppError from '../../error/appError';
import QueryBuilder from '../../builder/QueryBuilder';
import Audio, { AudioRating } from './audio.model';
import { IAudio } from './audio.interface';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import mongoose from 'mongoose';
import AudioBookmark from '../audioBookmark/audio.bookmark.model';

// Create Audio
const createAudio = async (userId: string, payload: IAudio) => {
    const result = await Audio.create({ ...payload, user: userId });
    return result;
};

// Get All Audios with QueryBuilder
const getAllAudios = async (query: Record<string, unknown>) => {
    const audioQuery = new QueryBuilder(
        Audio.find().populate('audioTopic'),
        query
    )
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await audioQuery.modelQuery;
    const meta = await audioQuery.countTotal();

    return {
        meta,
        result,
    };
};

// Get All audios with QueryBuilder
const getMyAudios = async (userId: string, query: Record<string, unknown>) => {
    const audioQuery = new QueryBuilder(
        Audio.find({ user: userId }).populate('audioTopic'),
        query
    )
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await audioQuery.modelQuery;
    const meta = await audioQuery.countTotal();

    return {
        meta,
        result,
    };
};

// Get Audio by ID
const getAudioById = async (audioId: string) => {
    const audio = await Audio.findById(audioId).populate('audioTopic');
    if (!audio) {
        throw new AppError(httpStatus.NOT_FOUND, 'Audio not found');
    }
    return audio;
};

// Update Audio
const updateAudio = async (
    userId: string,
    audioId: string,
    payload: Partial<IAudio>
) => {
    const audio = await Audio.findOne({ user: userId, _id: audioId });
    if (!audio) {
        throw new AppError(httpStatus.NOT_FOUND, 'Audio not found');
    }
    const updatedAudio = await Audio.findByIdAndUpdate(audioId, payload, {
        new: true,
    });

    if (payload.audio_url && audio.audio_url) {
        deleteFileFromS3(audio.audio_url);
    }
    if (payload.cover_image && audio.cover_image) {
        deleteFileFromS3(audio.cover_image);
    }
    return updatedAudio;
};

// Delete Audio
const deleteAudio = async (userId: string, audioId: string) => {
    const audio = await Audio.findOne({ _id: audioId, user: userId });
    if (!audio) {
        throw new AppError(httpStatus.NOT_FOUND, 'Audio not found');
    }
    const result = await Audio.findByIdAndDelete(audioId);
    await AudioRating.deleteMany({ audio: audioId });
    await AudioBookmark.deleteMany({ audio: audioId });
    if (audio.audio_url) {
        deleteFileFromS3(audio.audio_url);
    }
    if (audio.cover_image) {
        deleteFileFromS3(audio.cover_image);
    }
    return result;
};

const giveRating = async (userId: string, audioId: string, rating: number) => {
    const ratingExist = await AudioRating.findOne({
        user: userId,
        audio: audioId,
    });
    if (ratingExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'You already rate that audio');
    }
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await AudioRating.create([{ user: userId, audio: audioId, rating }], {
            session,
        });

        const result = await Audio.findByIdAndUpdate(
            audioId,
            { $inc: { ratingCount: 1, totalRating: rating } },
            { new: true, session }
        );

        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const AudioService = {
    createAudio,
    getAllAudios,
    getAudioById,
    updateAudio,
    deleteAudio,
    getMyAudios,
    giveRating,
};

export default AudioService;
