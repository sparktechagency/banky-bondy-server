/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import RelativeService from './relative.service';

// Create Relative
const createRelative = catchAsync(async (req, res) => {
    // Assuming no file upload here, remove if you add file support
    const result = await RelativeService.createRelative(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Relative created successfully',
        data: result,
    });
});

// Get All Relatives
const getAllRelatives = catchAsync(async (req, res) => {
    const result = await RelativeService.getAllRelatives(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Relatives retrieved successfully',
        data: result,
    });
});

// Get Relative by ID
const getRelativeById = catchAsync(async (req, res) => {
    const { relativeId } = req.params;
    const result = await RelativeService.getRelativeById(relativeId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Relative retrieved successfully',
        data: result,
    });
});

// Update Relative
const updateRelative = catchAsync(async (req, res) => {
    // Assuming no file upload here, remove if you add file support
    const { relativeId } = req.params;
    const result = await RelativeService.updateRelative(
        req.user.profileId,
        relativeId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Relative updated successfully',
        data: result,
    });
});

// Delete Relative
const deleteRelative = catchAsync(async (req, res) => {
    const { relativeId } = req.params;
    const result = await RelativeService.deleteRelative(
        req.user.profileId,
        relativeId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Relative deleted successfully',
        data: result,
    });
});

const RelativeController = {
    createRelative,
    getAllRelatives,
    getRelativeById,
    updateRelative,
    deleteRelative,
};

export default RelativeController;
