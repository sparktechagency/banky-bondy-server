import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import feedbackService from './feedback.services';

const createFeedBack = catchAsync(async (req, res) => {
    const result = await feedbackService.createFeedBack(
        req?.user?.profileId,
        req?.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Feedback send  successfully',
        data: result,
    });
});

//
const replyFeedback = catchAsync(async (req, res) => {
    const result = await feedbackService.replyFeedback(
        req?.params?.id,
        req?.body?.replyMessage
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Feedback replied  successfully',
        data: result,
    });
});
const deleteFeedback = catchAsync(async (req, res) => {
    const result = await feedbackService.deleteFeedbackFromDB(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Feedback deleted  successfully',
        data: result,
    });
});

// get all feedback
const getAllFeedback = catchAsync(async (req, res) => {
    const result = await feedbackService.getAllFeedback(req?.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Feedback retrieved  successfully',
        data: result,
    });
});

const feedbackController = {
    createFeedBack,
    replyFeedback,
    deleteFeedback,
    getAllFeedback,
};

export default feedbackController;
