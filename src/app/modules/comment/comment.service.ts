/* eslint-disable @typescript-eslint/no-explicit-any */
import { IComment } from './comment.interface';
import Comment from './comment.model';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

const createComment = async (user: JwtPayload, payload: Partial<IComment>) => {
    const commentData: any = {
        ...payload,
        commentor: user.profileId,
        likers: [],
    };
    const result = await Comment.create(commentData);
    return result;
};

const createReply = async (user: JwtPayload, payload: IComment) => {
    console.log('Creating reply with payload:');
    const comment = await Comment.findById(payload.parent);
    if (!comment) {
        throw new AppError(404, 'Parent comment not found');
    }
    const replyData: any = {
        ...payload,
        commentor: user.profileId,
        likers: [],
        institutionConversation: comment.institutionConversation,
    };
    const result = await Comment.create(replyData);
    return result;
};

const updateComment = async (
    user: JwtPayload,
    id: string,
    payload: Partial<IComment>
) => {
    const result = await Comment.findOneAndUpdate(
        { _id: id, commentor: user.profileId },
        payload,
        { new: true, runValidators: true }
    );
    if (!result) {
        throw new AppError(
            404,
            'Comment not found or you are not authorized to update this comment'
        );
    }
    return result;
};

const deleteComment = async (profileId: string, id: string) => {
    const result = await Comment.findOneAndDelete({
        _id: id,
        commentor: profileId,
    });
    if (!result) {
        throw new AppError(
            404,
            'Comment not found or you are not authorized to update this comment'
        );
    }
    return result;
};

// like unlike comment
const likeUnlikeComment = async (commentId: string, user: JwtPayload) => {
    const comment = await Comment.findById(commentId).select('likers');
    if (!comment) {
        throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(user.profileId);

    const alreadyLiked = comment.likers.some((l) => l.equals(userObjectId));

    let updatedComment: any;
    if (alreadyLiked) {
        updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $pull: { likers: userObjectId } },
            { new: true }
        ).select('likers');
    } else {
        updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $push: { likers: userObjectId } },
            { new: true }
        ).select('likers');
    }

    return {
        commentId,
        liked: !alreadyLiked,
        totalLikes: updatedComment?.likers.length ?? 0,
    };
};

const getInstitutionConversationComments = async (
    profileId: string,
    institutionConversation: string,
    query: Record<string, any>
) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
        {
            $match: {
                institutionConversation: new mongoose.Types.ObjectId(
                    institutionConversation
                ),
                parent: null,
            },
        },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'commentor',
                foreignField: '_id',
                as: 'commentorDetails',
            },
        },
        {
            $addFields: {
                commentorDetails: '$commentorDetails',
                isMyComment: {
                    $eq: ['$commentor', new mongoose.Types.ObjectId(profileId)],
                },
                totalLike: { $size: '$likers' },
                isMyLike: {
                    $in: [new mongoose.Types.ObjectId(profileId), '$likers'],
                },
            },
        },
        { $unwind: '$commentorDetails' },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'parent',
                as: 'replies',
            },
        },

        {
            $addFields: {
                totalReplies: { $size: '$replies' },
            },
        },
        {
            $project: {
                _id: 1,
                text: 1,
                image: 1,
                createdAt: 1,
                updatedAt: 1,
                commentorName: '$commentorDetails.name',
                commentorProfileImage: '$commentorDetails.profile_image',
                totalReplies: 1,
                totalLike: 1,
                isMyComment: 1,
                isMyLike: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);

    const result = comments[0]?.result || [];
    const total = comments[0]?.totalCount[0]?.total || 0;
    const totalPage = Math.ceil(total / limit);

    const response = {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        result,
    };

    return response;
};
const getReplies = async (
    profileId: string,
    parentId: string,
    query: Record<string, any>
) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
        {
            $match: {
                parent: new mongoose.Types.ObjectId(parentId),
            },
        },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'commentor',
                foreignField: '_id',
                as: 'commentorDetails',
            },
        },
        {
            $addFields: {
                commentorDetails: '$commentorDetails',
                isMyComment: {
                    $eq: ['$commentor', new mongoose.Types.ObjectId(profileId)],
                },
                totalLike: { $size: '$likers' },
            },
        },
        { $unwind: '$commentorDetails' },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'parent',
                as: 'replies',
            },
        },

        {
            $addFields: {
                totalReplies: { $size: '$replies' },
            },
        },
        {
            $project: {
                _id: 1,
                text: 1,
                createdAt: 1,
                updatedAt: 1,
                commentorName: '$commentorDetails.name',
                commentorProfileImage: '$commentorDetails.profile_image',
                totalReplies: 1,
                isMyComment: 1,
                totalLike: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);

    const result = comments[0]?.result || [];
    const total = comments[0]?.totalCount[0]?.total || 0;
    const totalPage = Math.ceil(total / limit);

    const response = {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        result,
    };

    return response;
};

const getAllLikersForComment = async (commentId: string) => {
    const comment = await Comment.findById(commentId).populate(
        'likers',
        'name profile_image'
    );

    if (!comment) {
        throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    const likers = comment.likers;

    return likers;
};

const CommentServices = {
    createComment,
    createReply,
    updateComment,
    deleteComment,
    likeUnlikeComment,
    getInstitutionConversationComments,
    getReplies,
    getAllLikersForComment,
};
export default CommentServices;
