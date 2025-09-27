import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import friendRequestService from './friendRequest.service';

const sendFriendRequest = catchAsync(async (req, res) => {
    const result = await friendRequestService.sendFriendRequest(
        req.user.profileId,
        req.body.receiver
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Friend request sent',
        data: result,
    });
});

const acceptRejectRequest = catchAsync(async (req, res) => {
    const result = await friendRequestService.acceptRejectRequest(
        req.params.id,
        req.body.status
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Friend request status updated',
        data: result,
    });
});

const getFriends = catchAsync(async (req, res) => {
    const result = await friendRequestService.getMyFriends(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Friends retrieved',
        data: result,
    });
});

const getFollowers = catchAsync(async (req, res) => {
    const result = await friendRequestService.getMyFollowers(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Followers retrieved',
        data: result,
    });
});

const getFollowing = catchAsync(async (req, res) => {
    const result = await friendRequestService.getMyFollowing(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Following retrieved',
        data: result,
    });
});

const cancelRequest = catchAsync(async (req, res) => {
    const result = await friendRequestService.cancelSentRequest(
        req.user.profileId,
        req.params.receiverId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Request canceled',
        data: result,
    });
});

const unfriend = catchAsync(async (req, res) => {
    const result = await friendRequestService.unfriend(
        req.user.profileId,
        req.params.friendId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Unfriended successfully',
        data: result,
    });
});

const friendRequestController = {
    sendFriendRequest,
    acceptRejectRequest,
    getFriends,
    getFollowers,
    getFollowing,
    cancelRequest,
    unfriend,
};

export default friendRequestController;
