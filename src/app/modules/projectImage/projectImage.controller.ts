/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import sendResponse from '../../utilities/sendResponse';
import projectImageServices from './projectImage.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';
import catchAsync from '../../utilities/catchasync';

const createProjectImage = catchAsync(async (req, res) => {
    const file: any = req.files?.project_image;
    if (req.files?.project_image) {
        req.body.image_url = getCloudFrontUrl(file[0].key);
    }
    const result = await projectImageServices.createProjectImage(
        req.user.profileId,
        req.params.projectId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Project Image created successfully',
        data: result,
    });
});

const getAllProjectImages = catchAsync(async (req, res) => {
    const result = await projectImageServices.getAllProjectImages(
        req.params.id,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project Images retrieved successfully',
        data: result,
    });
});

const updateProjectImage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const file: any = req.files?.project_image;
    if (req.files?.project_image) {
        req.body.image_url = getCloudFrontUrl(file[0].key);
    }
    const result = await projectImageServices.updateProjectImage(
        req.user.profileId,
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project Image updated successfully',
        data: result,
    });
});

const deleteProjectImage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await projectImageServices.deleteProjectImage(
        req.user.profileId,
        id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project Image deleted successfully',
        data: result,
    });
});

const ProjectImageController = {
    createProjectImage,
    getAllProjectImages,
    updateProjectImage,
    deleteProjectImage,
};

export default ProjectImageController;
