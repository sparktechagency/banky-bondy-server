/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';

import httpStatus from 'http-status';
import AppError from '../../error/appError';
import calculatePagination from '../../helper/paginationHelper';
import pick from '../../helper/pick';
import Message from '../message/message.model';
import Conversation from './conversation.model';

const getConversation = async (
    profileId: string,
    query: Record<string, unknown>
) => {
    const filters = pick(query, ['searchTerm', 'email', 'name']);

    const paginationOptions = pick(query, [
        'page',
        'limit',
        'sortBy',
        'sortOrder',
    ]);

    const { searchTerm } = filters;

    const {
        page,
        limit = 10,
        skip,
        sortBy,
        sortOrder,
    } = calculatePagination(paginationOptions);
    const sortConditions: { [key: string]: 1 | -1 } = {};
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const searchConditions = [];
    if (searchTerm) {
        searchConditions.push({
            $or: [
                { 'userData.name': { $regex: searchTerm, $options: 'i' } },
                { 'userData.email': { $regex: searchTerm, $options: 'i' } },
                { 'project.title': { $regex: searchTerm, $options: 'i' } },
                { 'project.name': { $regex: searchTerm, $options: 'i' } },
                { 'chatGroup.name': { $regex: searchTerm, $options: 'i' } },
                { 'bondLink.name': { $regex: searchTerm, $options: 'i' } },
            ],
        });
    }

    const pipeline: any[] = [
        {
            $match: {
                participants: new Types.ObjectId(profileId),
            },
        },
        {
            $lookup: {
                from: 'messages',
                localField: 'lastMessage',
                foreignField: '_id',
                as: 'lastMessage',
            },
        },
        {
            $unwind: {
                path: '$lastMessage',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'project',
            },
        },
        {
            $unwind: {
                path: '$project',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'chatgroups',
                localField: 'chatGroup',
                foreignField: '_id',
                as: 'chatGroup',
            },
        },
        {
            $unwind: {
                path: '$chatGroup',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'bondlinks',
                localField: 'bondLink',
                foreignField: '_id',
                as: 'bondLink',
            },
        },
        {
            $unwind: {
                path: '$bondLink',
                preserveNullAndEmptyArrays: true,
            },
        },
        // {
        //     $lookup: {
        //         from: 'normalusers',
        //         let: { participants: '$participants' },
        //         pipeline: [
        //             {
        //                 $match: {
        //                     $expr: {
        //                         $and: [
        //                             {
        //                                 $in: ['$_id', '$$participants'],
        //                             },
        //                             {
        //                                 $ne: [
        //                                     '$_id',
        //                                     new Types.ObjectId(profileId),
        //                                 ],
        //                             },
        //                         ],
        //                     },
        //                 },
        //             },
        //             {
        //                 $limit: 1,
        //             },
        //         ],
        //         as: 'otherUser',
        //     },
        // },

        {
            $lookup: {
                from: 'normalusers',
                let: { participants: '$participants' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$_id', '$$participants'] },
                                    {
                                        $ne: [
                                            '$_id',
                                            new Types.ObjectId(profileId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    { $limit: 1 },
                ],
                as: 'otherUser',
            },
        },
        {
            $unwind: {
                path: '$otherUser',
                preserveNullAndEmptyArrays: true, // keep the doc even if no otherUser
            },
        },
        {
            $lookup: {
                from: 'messages',
                let: { conversationId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            '$conversationId',
                                            '$$conversationId',
                                        ],
                                    },
                                    { $eq: ['$seen', false] },
                                    {
                                        $ne: [
                                            '$msgByUserId',
                                            new mongoose.Types.ObjectId(
                                                profileId
                                            ),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $count: 'unreadCount',
                    },
                ],
                as: 'unreadCountData',
            },
        },
        {
            $unwind: {
                path: '$unreadCountData',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                type: '$type',
                userData: {
                    _id: '$otherUser._id',
                    email: '$otherUser.email',
                    name: '$otherUser.name',
                    profile_image: '$otherUser.profile_image',
                },

                project: {
                    _id: 1,
                    name: 1,
                    cover_image: 1,
                },
                chatGroup: {
                    _id: 1,
                    name: 1,
                    image: 1,
                },
                bondLink: {
                    _id: 1,
                    name: 1,
                    status: 1,
                },
                lastMessage: 1,
                created_at: '$createdAt',
                updated_at: '$updatedAt',
                unseenMsg: { $ifNull: ['$unreadCountData.unreadCount', 0] },
            },
        },

        ...(searchConditions.length > 0
            ? [{ $match: { $and: searchConditions } }]
            : []),
        {
            $sort: { updated_at: -1 },
        },
        { $skip: skip },
        { $limit: limit },
    ];

    const [results, totalCount] = await Promise.all([
        Conversation.aggregate(pipeline),
        Conversation.aggregate([...pipeline.slice(0, -2), { $count: 'total' }]),
    ]);
    const total = totalCount[0]?.total || 0;
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: results,
    };
};

const getConversationMediaFiles = async (
    profileId: string,
    conversationId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findOne({
        participants: profileId,
        _id: conversationId,
    });

    if (!conversation) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'Conversation not found or access denied'
        );
    }

    const [result] = await Message.aggregate([
        {
            $match: {
                conversationId: new mongoose.Types.ObjectId(conversationId),
            },
        },
        {
            $project: {
                media: {
                    $concatArrays: [
                        { $ifNull: ['$imageUrl', []] },
                        { $ifNull: ['$videoUrl', []] },
                        { $ifNull: ['$pdfUrl', []] },
                    ],
                },
            },
        },
        { $unwind: '$media' },
        {
            $facet: {
                paginatedResults: [
                    { $sort: { _id: 1 } }, // optional sort
                    { $skip: skip },
                    { $limit: limit },
                    { $group: { _id: null, media: { $push: '$media' } } },
                ],
                totalCount: [{ $count: 'count' }],
            },
        },
    ]);

    const urls = result.paginatedResults[0]?.media || [];
    const totalUrls = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalUrls / limit);

    return {
        meta: {
            page,
            limit,
            totalPage: totalPages,
            total: totalUrls,
        },
        urls,
    };
};

const ConversationService = {
    getConversation,
    getConversationMediaFiles,
};

export default ConversationService;
