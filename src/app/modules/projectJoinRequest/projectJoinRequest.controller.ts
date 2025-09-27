import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProjectJoinRequestServices from './projectJoinRequest.service';

const sendJoinRequest = catchAsync(async (req, res) => {
    const result = await ProjectJoinRequestServices.sendJoinRequest(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Join request sent successfully',
        data: result,
    });
});
const approveRejectRequest = catchAsync(async (req, res) => {
    const result = await ProjectJoinRequestServices.approveRejectRequest(
        req.user.profileId,
        req.params.id,
        req.body.status
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Join request ${req.body.status} successfully`,
        data: result,
    });
});
const getJoinRequests = catchAsync(async (req, res) => {
    const result = await ProjectJoinRequestServices.getJoinRequests(
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Join requests retrieved successfully`,
        data: result,
    });
});

const ProjectJoinRequestController = {
    sendJoinRequest,
    approveRejectRequest,
    getJoinRequests,
};
export default ProjectJoinRequestController;
