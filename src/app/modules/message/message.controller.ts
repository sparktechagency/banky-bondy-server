import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import messageServices from './message.service';

const getMessages = catchAsync(async (req, res) => {
    const result = await messageServices.getMessages(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Message retrieved successfully',
        data: result,
    });
});

const MessageController = { getMessages };
export default MessageController;
