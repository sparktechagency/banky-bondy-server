/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProjectDocument } from './projectDocument.interface';
import ProjectDocument from './projectDocument.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Project from '../project/project.model';
import ProjectMember from '../projectMember/projectMember.model';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';

const createProjectDocument = async (
    userId: string,
    projectId: string,
    payload: IProjectDocument
) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }
    if (project.owner.toString() != userId) {
        const member = await ProjectMember.exists({
            user: userId,
            project: projectId,
        });
        if (!member) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'You are not that project member'
            );
        }
    }

    const result = await ProjectDocument.create({
        ...payload,
        project: projectId,
        addedBy: userId,
    });
    return result;
};

const getAllProjectDocuments = async (
    projectId: string,
    query: Record<string, unknown>
) => {
    const resultQuery = new QueryBuilder(
        ProjectDocument.find({ project: projectId }).populate({
            path: 'addedBy',
            select: 'name ',
        }),
        query
    )
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await resultQuery.modelQuery;
    const meta = await resultQuery.countTotal();
    return {
        meta,
        result,
    };
};

const updateProjectDocument = async (
    userId: string,
    id: string,
    payload: Partial<IProjectDocument>
) => {
    const document: any = await ProjectDocument.findById(id).populate({
        path: 'project',
        select: 'owner',
    });
    if (!document) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project Document not found');
    }
    if (
        document.addedBy != document.project.owner &&
        document.addedBy != userId
    ) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "You don't have permission to update this document"
        );
    }
    const result = await ProjectDocument.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

const deleteProjectDocument = async (userId: string, id: string) => {
    const document: any = await ProjectDocument.findById(id).populate({
        path: 'project',
        select: 'owner',
    });
    if (!document) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project Document not found');
    }
    if (
        document.project.owner != userId &&
        document.addedBy.toString() != userId
    ) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "You don't have permission to delete this document"
        );
    }
    const result = await ProjectDocument.findByIdAndDelete(id);
    deleteFileFromS3(document.document_url);
    return result;
};

const ProjectDocumentServices = {
    createProjectDocument,
    getAllProjectDocuments,
    updateProjectDocument,
    deleteProjectDocument,
};

export default ProjectDocumentServices;
