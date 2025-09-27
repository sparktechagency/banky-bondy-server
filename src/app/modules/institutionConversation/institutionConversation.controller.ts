import { Request, Response } from 'express';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import InstitutionConversationService from './institutionConversation.service';
import httpStatus from 'http-status';

// Create
const create = catchAsync(async (req: Request, res: Response) => {
    const result =
        await InstitutionConversationService.createInstitutionConversation(
            req.user.profileId,
            req.body
        );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'InstitutionConversation created successfully',
        data: result,
    });
});

// Get All
const getAll = catchAsync(async (req: Request, res: Response) => {
    const result =
        await InstitutionConversationService.getAllInstitutionConversations(
            req.params.id,
            req.user.profileId,
            req.query
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'InstitutionConversations fetched successfully',
        data: result,
    });
});

// Get Single
const getById = catchAsync(async (req: Request, res: Response) => {
    const result =
        await InstitutionConversationService.getInstitutionConversationById(
            req.params.id
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'InstitutionConversation fetched successfully',
        data: result,
    });
});

// Update
const update = catchAsync(async (req: Request, res: Response) => {
    const result =
        await InstitutionConversationService.updateInstitutionConversation(
            req.user.profileId,
            req.params.id,
            req.body
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'InstitutionConversation updated successfully',
        data: result,
    });
});

// Delete
const remove = catchAsync(async (req: Request, res: Response) => {
    const result =
        await InstitutionConversationService.deleteInstitutionConversation(
            req.user.profileId,
            req.params.id
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'InstitutionConversation deleted successfully',
        data: result,
    });
});

const InstitutionConversationController = {
    create,
    getAll,
    getById,
    update,
    remove,
};

export default InstitutionConversationController;
