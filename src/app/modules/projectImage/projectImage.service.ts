/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProjectImage } from './projectImage.interface';
import ProjectImage from './projectImage.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Project from '../project/project.model';
import ProjectMember from '../projectMember/projectMember.model';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';

const createProjectImage = async (
    userId: string,
    projectId: string,
    payload: IProjectImage
) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }

    if (userId != project.owner.toString()) {
        const member = await ProjectMember.exists({
            user: userId,
            project: projectId,
        });
        if (!member) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'You are not a member of that project'
            );
        }
    }

    const result = await ProjectImage.create({
        ...payload,
        project: projectId,
        addedBy: userId,
    });
    return result;
};

const getAllProjectImages = async (
    projectId: string,
    query: Record<string, unknown>
) => {
    const resultQuery = new QueryBuilder(
        ProjectImage.find({ project: projectId }).populate({
            path: 'addedBy',
            select: 'name',
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

const updateProjectImage = async (
    userId: string,
    id: string,
    payload: Partial<IProjectImage>
) => {
    const image: any = await ProjectImage.findById(id).populate({
        path: 'project',
        select: 'owner',
    });
    if (!image) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project Image not found');
    }
    if (image.addedBy != image.project.owner && image.addedBy != userId) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "You don't have permission to update this image"
        );
    }
    const result = await ProjectImage.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

const deleteProjectImage = async (userId: string, id: string) => {
    const image: any = await ProjectImage.findById(id).populate({
        path: 'project',
        select: 'owner',
    });
    if (!image) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project Image not found');
    }
    if (userId != image.project.owner && image.addedBy != userId) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "You don't have permission to delete this image"
        );
    }
    const result = await ProjectImage.findByIdAndDelete(id);
    deleteFileFromS3(image.image_url);
    return result;
};

const ProjectImageServices = {
    createProjectImage,
    getAllProjectImages,
    updateProjectImage,
    deleteProjectImage,
};

export default ProjectImageServices;
