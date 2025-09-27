/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import httpStatus from 'http-status';
import InstitutionService from './institution.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

// Create
const createInstitution = catchAsync(async (req, res) => {
    const file: any = req.files?.institution_cover;
    if (req.files?.institution_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const result = await InstitutionService.createInstitution(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Institution created successfully',
        data: result,
    });
});

// Get All
const getAllInstitutions = catchAsync(async (req, res) => {
    const result = await InstitutionService.getAllInstitutions(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institutions retrieved successfully',
        data: result,
    });
});

// Get By ID
const getInstitutionById = catchAsync(async (req, res) => {
    const result = await InstitutionService.getInstitutionById(
        req.params.institutionId,
        req.user.profileId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institution retrieved successfully',
        data: result,
    });
});

// Update
const updateInstitution = catchAsync(async (req, res) => {
    const file: any = req.files?.institution_cover;
    if (req.files?.institution_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const result = await InstitutionService.updateInstitution(
        req.user.profileId,
        req.params.institutionId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institution updated successfully',
        data: result,
    });
});

// Delete
const deleteInstitution = catchAsync(async (req, res) => {
    const result = await InstitutionService.deleteInstitution(
        req.user.profileId,
        req.params.institutionId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institution deleted successfully',
        data: result,
    });
});

const joinLeaveInstitution = catchAsync(async (req, res) => {
    const result = await InstitutionService.joinLeaveInstitution(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Joined  successfully',
        data: result,
    });
});

const InstitutionController = {
    createInstitution,
    getAllInstitutions,
    getInstitutionById,
    updateInstitution,
    deleteInstitution,
    joinLeaveInstitution,
};

export default InstitutionController;
