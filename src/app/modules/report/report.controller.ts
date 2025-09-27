import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReportService from './report.service';

const createReport = catchAsync(async (req, res) => {
    const result = await ReportService.createReport(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report summited successfully',
        data: result,
    });
});
const getAllReports = catchAsync(async (req, res) => {
    const result = await ReportService.getAllReports(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reports retrieved successfully',
        data: result,
    });
});
const deleteReport = catchAsync(async (req, res) => {
    const result = await ReportService.deleteReport(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reports deleted successfully',
        data: result,
    });
});

const ReportController = {
    createReport,
    getAllReports,
    deleteReport,
};

export default ReportController;
