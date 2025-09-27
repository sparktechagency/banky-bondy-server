/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import commentServices from './comment.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

const createComment = catchAsync(async (req, res) => {
    const file: any = req.files?.comment_image;
    if (req.files?.comment_image) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await commentServices.createComment(req.user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment created successfully',
        data: result,
    });
});

const createReply = catchAsync(async (req, res) => {
    const file: any = req.files?.comment_image;
    if (req.files?.comment_image) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await commentServices.createReply(req.user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reply created successfully',
        data: result,
    });
});
const updateComment = catchAsync(async (req, res) => {
    const file: any = req.files?.comment_image;
    if (req.files?.comment_image) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await commentServices.updateComment(
        req.user,
        req.params.id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment updated successfully',
        data: result,
    });
});
const deleteComment = catchAsync(async (req, res) => {
    const result = await commentServices.deleteComment(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: result,
    });
});
const likeUnlikeComment = catchAsync(async (req, res) => {
    const result = await commentServices.likeUnlikeComment(
        req.params.id,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment  successfully',
        data: result,
    });
});
const getPodcastComments = catchAsync(async (req, res) => {
    const result = await commentServices.getInstitutionConversationComments(
        req.user.profileId,
        req.params.id,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Podcast Comment retrieved  successfully',
        data: result,
    });
});
const getReplies = catchAsync(async (req, res) => {
    const result = await commentServices.getReplies(
        req.user.profileId,
        req.params.id,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Replies retrieved  successfully',
        data: result,
    });
});
const getAllLikersForComment = catchAsync(async (req, res) => {
    const result = await commentServices.getAllLikersForComment(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Likers retrieved  successfully',
        data: result,
    });
});

const CommentController = {
    createComment,
    createReply,
    updateComment,
    deleteComment,
    getPodcastComments,
    likeUnlikeComment,
    getReplies,
    getAllLikersForComment,
};
export default CommentController;
