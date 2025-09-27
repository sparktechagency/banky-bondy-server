import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import MetaService from './meta.service';

const getDashboardMetaData = catchAsync(async (req, res) => {
    const result = await MetaService.getDashboardMetaData();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dashboard meta data retrieved successfully',
        data: result,
    });
});

const getUserChartData = catchAsync(async (req, res) => {
    const result = await MetaService.getUserChartData(Number(req?.query.year));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User chart data retrieved successfully',
        data: result,
    });
});
const donorGrowthChartData = catchAsync(async (req, res) => {
    const result = await MetaService.donorGrowthChartData(
        Number(req?.query.year)
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Donor growth chart data retrieved successfully',
        data: result,
    });
});
const bondChartData = catchAsync(async (req, res) => {
    const result = await MetaService.bondChartData(Number(req?.query.year));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bond chart data retrieved successfully',
        data: result,
    });
});
const getInstitutionChartData = catchAsync(async (req, res) => {
    const result = await MetaService.getInstitutionChartData(
        Number(req?.query.year)
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institution chart data retrieved successfully',
        data: result,
    });
});
const getAudioPieChartData = catchAsync(async (req, res) => {
    const result = await MetaService.getAudioPieChartData();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio chart data retrieved successfully',
        data: result,
    });
});
const getEarningChartData = catchAsync(async (req, res) => {
    const result = await MetaService.getEarningChartData(
        Number(req.query.year)
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Earning chart data retrieved successfully',
        data: result,
    });
});

const MetaController = {
    getDashboardMetaData,
    getUserChartData,
    getAudioPieChartData,
    donorGrowthChartData,
    getInstitutionChartData,
    bondChartData,
    getEarningChartData,
};

export default MetaController;
