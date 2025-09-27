/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import bannerServices from './banner.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

const createBanner = catchAsync(async (req, res) => {
    const file: any = req.files?.banner;
    if (req.files?.banner) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await bannerServices.createBanner(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banner created successfully',
        data: result,
    });
});

const getAllBanners = catchAsync(async (req, res) => {
    const result = await bannerServices.getAllBanners(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banners retrieved successfully',
        data: result,
    });
});

const updateBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    const file: any = req.files?.banner;
    if (req.files?.banner) {
        req.body.image = getCloudFrontUrl(file[0].key);
    }
    const result = await bannerServices.updateBanner(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banner updated successfully',
        data: result,
    });
});

// delete banner
const deleteBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await bannerServices.deleteBanner(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banner deleted successfully',
        data: result,
    });
});

const BannerController = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner,
};

export default BannerController;
