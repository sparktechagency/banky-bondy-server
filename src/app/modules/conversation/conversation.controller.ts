import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ConversationService from './conversation.service';

const getChatList = catchAsync(async (req, res) => {
    const result = await ConversationService.getConversation(
        req?.user?.profileId,
        req.query
    );

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Conversation retrieved successfully',
        data: result,
    });
});

const getConversationMediaFiles = catchAsync(async (req, res) => {
    const result = await ConversationService.getConversationMediaFiles(
        req?.user?.profileId,
        req.params.id,
        req.query
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Media files retrieved successfully',
        data: result,
    });
});

const ConversationController = {
    getChatList,
    getConversationMediaFiles,
};

export default ConversationController;
