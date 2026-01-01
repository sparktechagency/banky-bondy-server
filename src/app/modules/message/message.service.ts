/* eslint-disable @typescript-eslint/no-explicit-any */
import Conversation from '../conversation/conversation.model';
import Message from './message.model';

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ENUM_CONVERSATION_TYPE } from '../conversation/conversation.enum';

const getMessages = async (
    profileId: string,
    query: Record<string, unknown>
) => {
    let conversationId;
    if (query.userId) {
        const conversation = await Conversation.findOne({
            participants: {
                $all: [
                    new mongoose.Types.ObjectId(profileId),
                    new mongoose.Types.ObjectId(query.userId as string),
                ],
            },
            type: ENUM_CONVERSATION_TYPE.oneToOne,
        });
        if (!conversation) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Conversation not found between the users'
            );
        }
        conversationId = conversation._id.toString();
    } else if (query.projectId) {
        const conversation = await Conversation.findOne({
            project: new mongoose.Types.ObjectId(query.projectId as string),
            participants: {
                $in: [new mongoose.Types.ObjectId(profileId)],
            },
        });
        if (!conversation) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Conversation not found for the project'
            );
        }
        conversationId = conversation._id.toString();
    } else if (query.chatGroupId) {
        const conversation = await Conversation.findOne({
            chatGroup: new mongoose.Types.ObjectId(query.chatGroupId as string),
            participants: {
                $in: [new mongoose.Types.ObjectId(profileId)],
            },
        });
        if (!conversation) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Conversation not found for the chat group'
            );
        }
        conversationId = conversation._id.toString();
    } else if (query.bondLinkId) {
        const conversation = await Conversation.findOne({
            bondLink: new mongoose.Types.ObjectId(query.bondLinkId as string),
            participants: {
                $in: [new mongoose.Types.ObjectId(profileId)],
            },
        });
        if (!conversation) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Conversation not found for the bond link'
            );
        }
        conversationId = conversation._id.toString();
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = (query?.searchTerm as string) || '';

    const messages = await Message.aggregate([
        {
            $match: {
                conversationId: new mongoose.Types.ObjectId(conversationId),
                text: { $regex: searchTerm, $options: 'i' },
            },
        },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'msgByUserId',
                foreignField: '_id',
                as: 'userDetails',
            },
        },
        { $unwind: '$userDetails' },
        {
            $addFields: {
                isMyMessage: {
                    $eq: [
                        '$msgByUserId',
                        new mongoose.Types.ObjectId(profileId),
                    ],
                },
            },
        },
        {
            $project: {
                text: 1,
                imageUrl: 1,
                videoUrl: 1,
                pdfUrl: 1,
                seen: 1,
                msgByUserId: 1,
                conversationId: 1,
                createdAt: 1,
                updatedAt: 1,
                'userDetails.name': 1,
                'userDetails.profile_image': 1,
                isMyMessage: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);

    const result = messages[0]?.result || [];
    const total = messages[0]?.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const response = {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        result,
    };

    return response;
};

const deleteMessage = async (messageId: string, userId: string) => {
    const message = await Message.findOne({
        _id: messageId,
        msgByUserId: userId,
    });
    if (!message) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Message not found or you are not authorized to delete this message'
        );
    }
    const result = await Message.findByIdAndUpdate(
        messageId,
        { isDeleted: true },
        { new: true, runValidators: true }
    );
    return result;
};
// make changes-------------------

const MessageService = {
    getMessages,
    deleteMessage,
};

export default MessageService;
