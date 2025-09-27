/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import sendResponse from '../../utilities/sendResponse';
import projectDocumentServices from './projectDocument.service';
import catchAsync from '../../utilities/catchasync';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

const createProjectDocument = catchAsync(async (req, res) => {
    const file: any = req.files?.project_ducument;
    if (req.files?.project_ducument) {
        req.body.document_url = getCloudFrontUrl(file[0].key);
    }
    const result = await projectDocumentServices.createProjectDocument(
        req.user.profileId,
        req.params.projectId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Project Document created successfully',
        data: result,
    });
});

const getAllProjectDocuments = catchAsync(async (req, res) => {
    const result = await projectDocumentServices.getAllProjectDocuments(
        req.params.id,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project Documents retrieved successfully',
        data: result,
    });
});

const updateProjectDocument = catchAsync(async (req, res) => {
    const { id } = req.params;
    const file: any = req.files?.project_ducument;
    if (req.files?.project_ducument) {
        req.body.document_url = getCloudFrontUrl(file[0].key);
    }
    const result = await projectDocumentServices.updateProjectDocument(
        req.user.profileId,
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project Document updated successfully',
        data: result,
    });
});

const deleteProjectDocument = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await projectDocumentServices.deleteProjectDocument(
        req.user.profileId,
        id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project Document deleted successfully',
        data: result,
    });
});

const ProjectDocumentController = {
    createProjectDocument,
    getAllProjectDocuments,
    updateProjectDocument,
    deleteProjectDocument,
};

export default ProjectDocumentController;
