import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Conversation from '../conversation/conversation.model';
import Project from '../project/project.model';
import ProjectMember from '../projectMember/projectMember.model';
import { ENUM_PROJECT_MUMBER_TYPE } from '../projectMember/projectMumber.enum';
import { ENUM_PROJECT_JOIN_REQEST_STATUS } from './projectJoinRequest.enum';
import ProjectJoinRequest from './projectJoinRequest.model';

const sendJoinRequest = async (userId: string, projectId: string) => {
    const project = await Project.exists({ _id: projectId });
    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }
    const existingRequest = await ProjectJoinRequest.findOne({
        user: userId,
        project: projectId,
    });
    if (existingRequest) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Join request already sent');
    }
    const result = await ProjectJoinRequest.create({
        user: userId,
        project: projectId,
    });
    return result;
};

const approveRejectRequest = async (
    userId: string,
    requestId: string,
    status: string
) => {
    const request = await ProjectJoinRequest.findById(requestId);
    if (!request) {
        throw new AppError(httpStatus.NOT_FOUND, 'Request not found');
    }

    const project = await Project.findById(request.project);
    if (project?.owner.toString() != userId) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'This is not your project join request'
        );
    }

    if (status == ENUM_PROJECT_JOIN_REQEST_STATUS.Approved) {
        const result = await ProjectMember.create({
            user: request.user,
            project: request.project,
            type: ENUM_PROJECT_MUMBER_TYPE.Consumer,
            role: 'Consumer',
        });
        await ProjectJoinRequest.findByIdAndDelete(requestId);
        await Conversation.findOneAndUpdate(
            { project: request.project },
            { $addToSet: { participants: request.user } }
        );
        return result;
    } else if (status == ENUM_PROJECT_JOIN_REQEST_STATUS.Rejected) {
        const result = await ProjectJoinRequest.findByIdAndDelete(requestId);
        return result;
    }
};

const getJoinRequests = async (projectId: string) => {
    const result = await ProjectJoinRequest.find({
        project: projectId,
    }).populate({ path: 'user', select: 'name profile_image' });
    return result;
};

const ProjectJoinRequestServices = {
    sendJoinRequest,
    approveRejectRequest,
    getJoinRequests,
};

export default ProjectJoinRequestServices;
