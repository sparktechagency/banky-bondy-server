import httpStatus from 'http-status';
import AppError from '../../error/appError';

import QueryBuilder from '../../builder/QueryBuilder';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { IAudioTopic } from './audio-topic.interface';
import AudioTopic from './audio-topic.model';

// create category into db
const createAudioTopicIntoDB = async (payload: IAudioTopic) => {
    const result = await AudioTopic.create(payload);
    return result;
};
const updateAudioTopicIntoDB = async (
    id: string,
    payload: Partial<IAudioTopic>
) => {
    const audioTopic = await AudioTopic.findOne({ _id: id });
    if (!audioTopic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Audio topic not found');
    }
    const result = await AudioTopic.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    if (payload.topic_image) {
        if (audioTopic.topic_image) {
            deleteFileFromS3(audioTopic.topic_image);
        }
    }
    return result;
};

const getAllTopics = async (query: Record<string, unknown>) => {
    const resultQuery = new QueryBuilder(
        AudioTopic.find({ isDeleted: false }),
        query
    )
        .search(['name'])
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await resultQuery.modelQuery;
    const meta = await resultQuery.countTotal();
    return {
        meta,
        result,
    };
};

const getSingleTopic = async (id: string) => {
    const topic = await AudioTopic.findById(id);
    if (!topic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    return topic;
};

// delete category
const deleteAudioTopicFromDB = async (id: string) => {
    const result = await AudioTopic.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Audio topic not found');
    }
    if (result.topic_image) {
        deleteFileFromS3(result.topic_image);
    }
    return result;
};

const categoryService = {
    createAudioTopicIntoDB,
    updateAudioTopicIntoDB,
    getAllTopics,
    getSingleTopic,
    deleteAudioTopicFromDB,
};

export default categoryService;
