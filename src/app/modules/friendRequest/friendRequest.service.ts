/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ENUM_FRIEND_REQUEST_STATUS } from './friendRequest.enum';
import FriendRequest from './friendRequest.model';
type ENUM_FRIEND_REQUEST_STATUS = keyof typeof ENUM_FRIEND_REQUEST_STATUS;
const sendFriendRequest = async (sender: string, receiver: string) => {
    if (sender === receiver)
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Cannot send request to self'
        );

    const existing = await FriendRequest.findOne({ sender, receiver });
    if (existing)
        throw new AppError(httpStatus.BAD_REQUEST, 'Request already exists');

    return await FriendRequest.create({ sender, receiver });
};

const acceptRejectRequest = async (
    requestId: string,
    status: ENUM_FRIEND_REQUEST_STATUS
) => {
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== ENUM_FRIEND_REQUEST_STATUS.Pending) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid or already handled request'
        );
    }

    request.status = status;
    return await request.save();
};

const getMyFriends = async (userId: string, query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';
    const matchStage: any = {
        $or: [
            {
                sender: new mongoose.Types.ObjectId(userId),
                status: ENUM_FRIEND_REQUEST_STATUS.Accepted,
            },
            {
                receiver: new mongoose.Types.ObjectId(userId),
                status: ENUM_FRIEND_REQUEST_STATUS.Accepted,
            },
        ],
    };

    const searchMatchStage = searchTerm
        ? {
              $or: [
                  { 'senderInfo.name': { $regex: searchTerm, $options: 'i' } },
                  {
                      'receiverInfo.name': {
                          $regex: searchTerm,
                          $options: 'i',
                      },
                  },
              ],
              $nor: [{ sender: userId }, { receiver: userId }],
          }
        : { $nor: [{ sender: userId }, { receiver: userId }] };

    const pipeline: any[] = [
        { $match: matchStage },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderInfo',
            },
        },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'receiver',
                foreignField: '_id',
                as: 'receiverInfo',
            },
        },
        { $unwind: { path: '$senderInfo', preserveNullAndEmptyArrays: true } },
        {
            $unwind: {
                path: '$receiverInfo',
                preserveNullAndEmptyArrays: true,
            },
        },

        // populate sender skills
        {
            $lookup: {
                from: 'skills',
                localField: 'senderInfo.skills',
                foreignField: '_id',
                as: 'senderInfo.skills',
            },
        },
        // populate receiver skills--
        {
            $lookup: {
                from: 'skills',
                localField: 'receiverInfo.skills',
                foreignField: '_id',
                as: 'receiverInfo.skills',
            },
        },
        { $match: searchMatchStage },
        {
            $facet: {
                meta: [{ $count: 'total' }],
                result: [
                    {
                        $project: {
                            _id: 1,
                            status: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            friendInfo: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            '$sender',
                                            new mongoose.Types.ObjectId(userId),
                                        ],
                                    },
                                    then: {
                                        _id: '$receiverInfo._id',
                                        name: '$receiverInfo.name',
                                        profile_image:
                                            '$receiverInfo.profile_image',
                                        skills: {
                                            $map: {
                                                input: '$receiverInfo.skills',
                                                as: 's',
                                                in: '$$s.name',
                                            },
                                        },
                                    },
                                    else: {
                                        _id: '$senderInfo._id',
                                        name: '$senderInfo.name',
                                        profile_image:
                                            '$senderInfo.profile_image',
                                        skills: {
                                            $map: {
                                                input: '$senderInfo.skills',
                                                as: 's',
                                                in: '$$s.name',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ],
            },
        },
    ];

    const aggResult = await FriendRequest.aggregate(pipeline);
    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.meta[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        result,
    };
};

// const getMyFollowers = async (userId: string) => {
//     return await FriendRequest.find({
//         receiver: userId,
//         status: ENUM_FRIEND_REQUEST_STATUS.Pending,
//     }).populate('sender');
// };

const getMyFollowers = async (userId: string, query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

    const matchStage: any = {
        receiver: new mongoose.Types.ObjectId(userId),
        status: ENUM_FRIEND_REQUEST_STATUS.Pending,
    };

    const searchMatchStage = searchTerm
        ? {
              'senderInfo.name': { $regex: searchTerm, $options: 'i' },
          }
        : {};

    const pipeline: any[] = [
        { $match: matchStage },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderInfo',
            },
        },
        { $unwind: { path: '$senderInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'skills',
                localField: 'senderInfo.skills',
                foreignField: '_id',
                as: 'senderInfo.skills',
            },
        },
        { $match: searchMatchStage },
        {
            $facet: {
                meta: [{ $count: 'total' }],
                result: [
                    {
                        $project: {
                            _id: 1,
                            status: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            followerInfo: {
                                _id: '$senderInfo._id',
                                name: '$senderInfo.name',
                                profile_image: '$senderInfo.profile_image',
                                skills: {
                                    $map: {
                                        input: '$senderInfo.skills',
                                        as: 's',
                                        in: '$$s.name',
                                    },
                                },
                            },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ],
            },
        },
    ];

    const aggResult = await FriendRequest.aggregate(pipeline);
    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.meta[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        result,
    };
};

// const getMyFollowing = async (userId: string) => {
//     return await FriendRequest.find({
//         sender: userId,
//         status: ENUM_FRIEND_REQUEST_STATUS.Pending,
//     }).populate('receiver');
// };

const getMyFollowing = async (userId: string, query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

    const matchStage: any = {
        sender: new mongoose.Types.ObjectId(userId),
        status: ENUM_FRIEND_REQUEST_STATUS.Pending,
    };

    const searchMatchStage = searchTerm
        ? { 'receiverInfo.name': { $regex: searchTerm, $options: 'i' } }
        : {};

    const pipeline: any[] = [
        { $match: matchStage },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'receiver',
                foreignField: '_id',
                as: 'receiverInfo',
            },
        },
        {
            $unwind: {
                path: '$receiverInfo',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'skills',
                localField: 'receiverInfo.skills',
                foreignField: '_id',
                as: 'receiverInfo.skills',
            },
        },
        { $match: searchMatchStage },
        {
            $facet: {
                meta: [{ $count: 'total' }],
                result: [
                    {
                        $project: {
                            _id: 1,
                            status: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            followingInfo: {
                                _id: '$receiverInfo._id',
                                name: '$receiverInfo.name',
                                profile_image: '$receiverInfo.profile_image',
                                skills: {
                                    $map: {
                                        input: '$receiverInfo.skills',
                                        as: 's',
                                        in: '$$s.name',
                                    },
                                },
                            },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ],
            },
        },
    ];

    const aggResult = await FriendRequest.aggregate(pipeline);
    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.meta[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        result,
    };
};

const cancelSentRequest = async (sender: string, receiver: string) => {
    return await FriendRequest.findOneAndDelete({
        sender,
        receiver,
        status: ENUM_FRIEND_REQUEST_STATUS.Pending,
    });
};

const unfriend = async (userId: string, friendId: string) => {
    console.log('userid', userId, friendId);
    return await FriendRequest.findOneAndDelete({
        $or: [
            {
                sender: userId,
                receiver: friendId,
                status: ENUM_FRIEND_REQUEST_STATUS.Accepted,
            },
            {
                sender: friendId,
                receiver: userId,
                status: ENUM_FRIEND_REQUEST_STATUS.Accepted,
            },
        ],
    });
};

const friendRequestService = {
    sendFriendRequest,
    acceptRejectRequest,
    getMyFriends,
    getMyFollowers,
    getMyFollowing,
    cancelSentRequest,
    unfriend,
};

export default friendRequestService;
