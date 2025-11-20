import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import bondRequestService from './bondRequest.service';

const createBondRequest = catchAsync(async (req, res) => {
    const result = await bondRequestService.createBondRequestIntoDB(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'BondRequest created successfully',
        data: result,
    });
});

const getAllBondRequests = catchAsync(async (req, res) => {
    const result = await bondRequestService.getAllBondRequests(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BondRequests retrieved successfully',
        data: result,
    });
});
const getLastBond = catchAsync(async (req, res) => {
    const result = await bondRequestService.getLastBond(req.user.profileId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Last bond retrieved successfully',
        data: result,
    });
});

const getMyBondRequests = catchAsync(async (req, res) => {
    const result = await bondRequestService.myBondRequests(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BondRequests retrieved successfully',
        data: result,
    });
});

const getSingleBondRequest = catchAsync(async (req, res) => {
    const result = await bondRequestService.getSingleBondRequest(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BondRequest retrieved successfully',
        data: result,
    });
});

const updateBondRequest = catchAsync(async (req, res) => {
    const result = await bondRequestService.updateBondRequestIntoDB(
        req.user.profileId,
        req.params.id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BondRequest updated successfully',
        data: result,
    });
});

const deleteBondRequest = catchAsync(async (req, res) => {
    const result = await bondRequestService.deleteBondRequestFromDB(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BondRequest deleted successfully',
        data: result,
    });
});

const getMatchingBondRequest = catchAsync(async (req, res) => {
    const result = await bondRequestService.getMatchingBondRequest(
        req.user.profileId,
        req.query.bondRequest as string,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BondRequest matching successfully',
        data: result,
    });
});

const bondRequestController = {
    createBondRequest,
    getAllBondRequests,
    getSingleBondRequest,
    updateBondRequest,
    deleteBondRequest,
    getMyBondRequests,
    getMatchingBondRequest,
    getLastBond,
};

export default bondRequestController;
