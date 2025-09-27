import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import bondService from './bond.service';

const createBond = catchAsync(async (req, res) => {
    const result = await bondService.createBondIntoDB(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Bond created successfully',
        data: result,
    });
});

const getAllBonds = catchAsync(async (req, res) => {
    const result = await bondService.getMyBonds(req.user.profileId, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your bonds retrieved successfully',
        data: result,
    });
});

const getSingleBond = catchAsync(async (req, res) => {
    const result = await bondService.getSingleBond(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bond retrieved successfully',
        data: result,
    });
});

const updateBond = catchAsync(async (req, res) => {
    const result = await bondService.updateBondIntoDB(
        req.user.profileId,
        req.params.id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bond updated successfully',
        data: result,
    });
});

const deleteBond = catchAsync(async (req, res) => {
    const result = await bondService.deleteBondFromDB(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bond deleted successfully',
        data: result,
    });
});
const getFilterItemsForMatchingBond = catchAsync(async (req, res) => {
    const result = await bondService.getFilterItemsForMatchingBond(
        req.user.profileId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bond filter items retrieved successfully',
        data: result,
    });
});

const bondController = {
    createBond,
    getAllBonds,
    getSingleBond,
    updateBond,
    deleteBond,
    getFilterItemsForMatchingBond,
};

export default bondController;
