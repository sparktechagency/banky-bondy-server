/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import NormalUserServices from './normalUser.services';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

const updateUserProfile = catchAsync(async (req, res) => {
    const file: any = req.files?.profile_image;
    if (req.files?.profile_image) {
        req.body.profile_image = getCloudFrontUrl(file[0].key);
    }
    const file2: any = req.files?.profile_cover;
    if (req.files?.profile_cover) {
        req.body.cover_image = getCloudFrontUrl(file2[0].key);
    }
    const result = await NormalUserServices.updateUserProfile(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    });
});

const getAllUser = catchAsync(async (req, res) => {
    const result = await NormalUserServices.getAllUser(req.user, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

const getSingleUser = catchAsync(async (req, res) => {
    const result = await NormalUserServices.getSingleUser(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

const NormalUserController = {
    updateUserProfile,
    getAllUser,
    getSingleUser,
};

export default NormalUserController;
