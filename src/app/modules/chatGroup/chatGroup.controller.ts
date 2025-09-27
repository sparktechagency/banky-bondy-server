/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import chatGroupServices from './chatGroup.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

const createGroupChat = catchAsync(async (req, res) => {
    const file: any = req.files?.group_chat_image;
    if (req.files?.group_chat_image) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await chatGroupServices.createGroupChat(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat group created successfully',
        data: result,
    });
});
const updateGroupData = catchAsync(async (req, res) => {
    const file: any = req.files?.group_chat_image;
    if (req.files?.group_chat_image) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await chatGroupServices.updateGroupData(
        req.params.id,
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat group updated successfully',
        data: result,
    });
});
const addMember = catchAsync(async (req, res) => {
    const result = await chatGroupServices.addMember(
        req.user.profileId,
        req.params.id,
        req.body.memberId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member added successfully',
        data: result,
    });
});
const removeMember = catchAsync(async (req, res) => {
    const result = await chatGroupServices.removeMember(
        req.user.profileId,
        req.params.id,
        req.body.memberId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member removed successfully',
        data: result,
    });
});

const ChatGroupController = {
    createGroupChat,
    addMember,
    removeMember,
    updateGroupData,
};
export default ChatGroupController;
