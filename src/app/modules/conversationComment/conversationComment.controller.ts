import { Request, Response } from 'express';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import httpStatus from 'http-status';
import ConversationCommentService from './conversationComment.service';

// Create
const create = catchAsync(async (req: Request, res: Response) => {
    const result = await ConversationCommentService.create(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Comment created successfully',
        data: result,
    });
});

// Get All
const getAll = catchAsync(async (_req: Request, res: Response) => {
    const result = await ConversationCommentService.getAll();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All comments fetched successfully',
        data: result,
    });
});

// Update
const update = catchAsync(async (req: Request, res: Response) => {
    const result = await ConversationCommentService.update(
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

// Delete
const remove = catchAsync(async (req: Request, res: Response) => {
    const result = await ConversationCommentService.remove(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: result,
    });
});

const ConversationCommentController = {
    create,
    getAll,
    update,
    remove,
};

export default ConversationCommentController;
