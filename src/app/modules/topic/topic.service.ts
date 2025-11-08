/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { ITopic } from './topic.interface';
import { Topic } from './topic.model';

// Create Topic
const createTopic = async (payload: ITopic) => {
    const result = await Topic.create(payload);
    return result;
};

// Get All Topics
// const getAllTopics = async (query: Record<string, unknown>) => {
//     const topicQuery = new QueryBuilder(Topic.find({ isDeleted: false }), query)
//         .search(['name'])
//         .fields()
//         .filter()
//         .paginate()
//         .sort();

//     const result = await topicQuery.modelQuery;
//     const meta = await topicQuery.countTotal();
//     return {
//         meta,
//         result,
//     };
// };

const getAllTopics = async (query: Record<string, unknown>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

    const filters: any = {};
    Object.keys(query).forEach((key) => {
        if (!['searchTerm', 'page', 'limit'].includes(key)) {
            filters[key] = query[key];
        }
    });

    const matchStage: any = { isDeleted: false };

    if (searchTerm) {
        matchStage.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
        ];
    }

    const topics = await Topic.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'audios',
                localField: '_id',
                foreignField: 'audioTopic',
                as: 'audios',
            },
        },
        {
            $addFields: {
                totalAudios: { $size: '$audios' },
            },
        },
        { $project: { audios: 0 } },
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
    ]);

    const totalCount = await Topic.countDocuments(matchStage);

    return {
        meta: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
        result: topics,
    };
};

// Get Topic by ID
const getTopicById = async (topicId: string) => {
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Topic not found');
    }
    return topic;
};

// Update Topic
const updateTopic = async (topicId: string, payload: ITopic) => {
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Topic not found');
    }

    const updatedTopic = await Topic.findByIdAndUpdate(
        topicId,
        { ...payload },
        { new: true }
    );

    if (payload.topic_image && topic.topic_image) {
        deleteFileFromS3(topic.topic_image);
    }

    return updatedTopic;
};

// Delete Topic
const deleteTopic = async (topicId: string) => {
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Topic not found');
    }
    const result = await Topic.findByIdAndUpdate(
        topicId,
        { isDeleted: true },
        { new: true, runValidators: true }
    );
    if (topic.topic_image) {
        deleteFileFromS3(topic.topic_image);
    }
    return result;
};

const TopicServices = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
};

export default TopicServices;
