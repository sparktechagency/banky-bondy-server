import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import recommendedUserServices from './recommendedUser.service';

const createRecommendedUsers = catchAsync(async (req, res) => {
    const result = await recommendedUserServices.createRecommendedUsers(
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    });
});

const getRecommendedUsers = catchAsync(async (req, res) => {
    const result = await recommendedUserServices.getRecommendedUsers(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Recommended user retrieved successfully',
        data: result,
    });
});

const RecommendedUserController = {
    createRecommendedUsers,
    getRecommendedUsers,
};
export default RecommendedUserController;
