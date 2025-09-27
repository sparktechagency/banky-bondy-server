/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProjectService from './project.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

// Create Project
const createProject = catchAsync(async (req, res) => {
    const file: any = req.files?.project_cover;
    if (req.files?.project_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const result = await ProjectService.createProject(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Project created successfully',
        data: result,
    });
});

// Get All Projects
const getAllProjects = catchAsync(async (req, res) => {
    const result = await ProjectService.getAllProjects(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Projects retrieved successfully',
        data: result,
    });
});
// Get my project
const getMyProjects = catchAsync(async (req, res) => {
    const result = await ProjectService.getMyProjects(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Projects retrieved successfully',
        data: result,
    });
});

// Get Project by ID
const getProjectById = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const result = await ProjectService.getProjectById(
        req.user.profileId,
        projectId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project retrieved successfully',
        data: result,
    });
});

// Update Project
const updateProject = catchAsync(async (req, res) => {
    const file: any = req.files?.project_cover;
    if (req.files?.project_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const { projectId } = req.params;
    const result = await ProjectService.updateProject(projectId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project updated successfully',
        data: result,
    });
});

// Delete Project
const deleteProject = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const result = await ProjectService.deleteProject(
        req.user.profileId,
        projectId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project deleted successfully',
        data: result,
    });
});

const ProjectController = {
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject,
};

export default ProjectController;
