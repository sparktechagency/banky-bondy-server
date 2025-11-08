/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { ENUM_CONVERSATION_TYPE } from '../conversation/conversation.enum';
import Conversation from '../conversation/conversation.model';
import Message from '../message/message.model';
import ProjectDocument from '../projectDocument/projectDocument.model';
import ProjectImage from '../projectImage/projectImage.model';
import ProjectJoinRequest from '../projectJoinRequest/projectJoinRequest.model';
import ProjectMember from '../projectMember/projectMember.model';
import { IProject } from './project.interface';
import Project from './project.model';

// Create Project
const createProject = async (userId: string, payload: IProject) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await Project.create([{ ...payload, owner: userId }], {
            session,
        });
        await Conversation.create(
            [
                {
                    participants: [userId],
                    lastMessage: null,
                    type: ENUM_CONVERSATION_TYPE.projectGroup,
                    institution: null,
                    project: result[0]._id,
                    chatGroup: null,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        return result[0];
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(
            httpStatus.NOT_FOUND,
            `${error.message}` || 'Something went wrong'
        );
    }
};

// const getAllProjects = async (query: Record<string, unknown>) => {
//     const projectQuery = new QueryBuilder(
//         Project.find().populate({
//             path: 'owner',
//             select: 'name profile_image',
//         }),
//         query
//     )
//         .search(['name', 'description'])
//         .filter()
//         .sort()
//         .paginate()
//         .fields();

//     const result = await projectQuery.modelQuery;
//     const meta = await projectQuery.countTotal();

//     return {
//         meta,
//         result,
//     };
// };

// const getAllProjects = async (query: Record<string, unknown>) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const searchTerm = query.searchTerm || '';

//     const filters: any = {};

//     Object.keys(query).forEach((key) => {
//         // Exclude `searchTerm`, `page`, and `limit` from filters
//         if (
//             !['searchTerm', 'page', 'limit'].includes(key) &&
//             query[key] !== undefined
//         ) {
//             filters[key] = query[key];
//         }
//     });

//     // Create the aggregation pipeline
//     const pipeline: any[] = [
//         {
//             $match: {
//                 ...filters,
//                 $or: [
//                     { name: { $regex: searchTerm, $options: 'i' } },
//                     { description: { $regex: searchTerm, $options: 'i' } },
//                 ],
//             },
//         },

//         // Lookup to populate the owner details
//         {
//             $lookup: {
//                 from: 'normalusers',
//                 localField: 'owner',
//                 foreignField: '_id',
//                 as: 'owner',
//             },
//         },

//         // Unwind the 'owner' array (since it's a single object, it will turn into a single entry)
//         { $unwind: '$owner' },

//         // Lookup to calculate the total number of participants for each project
//         {
//             $lookup: {
//                 from: 'projectmembers',
//                 localField: '_id',
//                 foreignField: 'project',
//                 as: 'participants',
//             },
//         },

//         // Add a field 'totalParticipate' to count the number of participants
//         {
//             $addFields: {
//                 totalParticipate: { $size: '$participants' },
//             },
//         },

//         // Select the fields you want to return, including owner details and total participants
//         {
//             $project: {
//                 _id: 1,
//                 name: 1,
//                 description: 1,
//                 status: 1,
//                 isPublic: 1,
//                 joinControll: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//                 cover_image: 1,
//                 totalParticipate: 1,
//                 'owner._id': 1,
//                 'owner.name': 1,
//                 'owner.profile_image': 1,
//             },
//         },

//         // Sorting (default is by 'createdAt' in descending order)
//         { $sort: { createdAt: -1 } },

//         // Pagination
//         { $skip: skip },
//         { $limit: limit },

//         // Count total projects for pagination
//         {
//             $facet: {
//                 meta: [{ $count: 'total' }],
//                 result: [],
//             },
//         },
//     ];

//     // Execute the aggregation pipeline
//     const aggResult = await Project.aggregate(pipeline);

//     // Get results and total count
//     const result = aggResult[0]?.result || [];
//     const total = aggResult[0]?.meta[0]?.total || 0;
//     const totalPages = Math.ceil(total / limit);

//     return {
//         meta: {
//             page,
//             limit,
//             total,
//             totalPages,
//         },
//         result,
//     };
// };
const getAllProjects = async (userId: string, query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

    // Filters: Add more filters based on project fields (excluding pagination and search)
    const filters: any = {};
    if (query.isPublic) {
        if (query.isPublic == 'true') {
            query.isPublic = true;
        } else {
            query.isPublic = false;
        }
    }

    Object.keys(query).forEach((key) => {
        if (
            ![
                'searchTerm',
                'page',
                'limit',
                'myProject',
                'joinProject',
            ].includes(key)
        ) {
            filters[key] = query[key];
        }
    });

    // If query.myProject is passed, fetch projects owned by the user
    const matchStage: any = {};
    if (query.myProject) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // If query.joinProject is passed, fetch projects where the user is a member
    if (query.joinProject) {
        const joinedProjects = await ProjectMember.find({
            user: userId,
        }).select('project');
        const joinedProjectIds = joinedProjects.map((member) => member.project);

        matchStage._id = { $in: joinedProjectIds }; // Only user's joined projects
    }

    // Include search term to search by name and description
    const searchMatchStage = searchTerm
        ? {
              $or: [
                  { name: { $regex: searchTerm, $options: 'i' } },
                  { description: { $regex: searchTerm, $options: 'i' } },
              ],
          }
        : {};

    // Aggregation pipeline
    const pipeline: any[] = [
        { $match: { ...matchStage, ...filters, ...searchMatchStage } },

        // Lookup to populate owner details
        {
            $lookup: {
                from: 'normalusers',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
            },
        },

        { $unwind: '$owner' },
        {
            $lookup: {
                from: 'projectmembers',
                localField: '_id',
                foreignField: 'project',
                as: 'participants',
            },
        },
        {
            $addFields: {
                totalParticipants: { $size: '$participants' },
                isJoined: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        '$participants.user',
                    ],
                },
                isOwner: {
                    $eq: [new mongoose.Types.ObjectId(userId), '$owner._id'],
                },
            },
        },
        {
            $lookup: {
                from: 'projectjoinrequests',
                localField: '_id',
                foreignField: 'project',
                as: 'joinRequests',
            },
        },
        {
            $addFields: {
                isJoinRequestSent: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        '$joinRequests.user',
                    ],
                },
            },
        },

        // Select only the necessary fields
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                status: 1,
                isPublic: 1,
                joinControll: 1,
                createdAt: 1,
                updatedAt: 1,
                cover_image: 1,
                totalParticipants: 1,
                'owner._id': 1,
                'owner.name': 1,
                'owner.profile_image': 1,
                isJoined: 1,
                isOwner: 1,
                isJoinRequestSent: 1,
            },
        },

        { $sort: { createdAt: -1 } },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ];

    // Execute the aggregation pipeline
    const aggResult = await Project.aggregate(pipeline);

    // Get results and total count
    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        result,
    };
};
const getMyProjects = async (
    userId: string,
    query: Record<string, unknown>
) => {
    // Let's assume we search on 'name' and 'description'
    const projectQuery = new QueryBuilder(Project.find({ ower: userId }), query)
        .search(['name', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await projectQuery.modelQuery;
    const meta = await projectQuery.countTotal();

    return {
        meta,
        result,
    };
};

// Get Project by ID
// const getProjectById = async (projectId: string) => {
//     const project = await Project.findById(projectId).populate({
//         path: 'owner',
//         select: 'name profile_image',
//     });
//     if (!project) {
//         throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
//     }
//     const totalParticipate = await ProjectMember.countDocuments({
//         project: projectId,
//     });

//     return {
//         ...project.toObject(),
//         totalParticipate,
//     };
// };
const getProjectById = async (userId: string, projectId: string) => {
    // Fetch the project details
    const project = await Project.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(projectId) },
        },
        // Lookup to populate owner details
        {
            $lookup: {
                from: 'normalusers',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
            },
        },
        { $unwind: '$owner' },
        // Lookup to populate participants (Project Members)
        {
            $lookup: {
                from: 'projectmembers',
                localField: '_id',
                foreignField: 'project',
                as: 'participants',
            },
        },
        {
            $addFields: {
                totalParticipants: { $size: '$participants' },
                isJoined: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        '$participants.user',
                    ],
                },
                isOwner: {
                    $eq: [new mongoose.Types.ObjectId(userId), '$owner._id'],
                },
            },
        },
        // Lookup to check if the join request exists
        {
            $lookup: {
                from: 'projectjoinrequests',
                localField: '_id',
                foreignField: 'project',
                as: 'joinRequests',
            },
        },
        {
            $addFields: {
                isJoinRequestSent: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        '$joinRequests.user',
                    ],
                },
            },
        },
        // Project select (only necessary fields)
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                status: 1,
                isPublic: 1,
                joinControll: 1,
                createdAt: 1,
                updatedAt: 1,
                cover_image: 1,
                totalParticipants: 1,
                'owner._id': 1,
                'owner.name': 1,
                'owner.profile_image': 1,
                isJoined: 1,
                isOwner: 1,
                isJoinRequestSent: 1,
            },
        },
    ]);

    if (!project || project.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }

    return project[0];
};

// Update Project
const updateProject = async (projectId: string, payload: Partial<IProject>) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }

    const updatedProject = await Project.findByIdAndUpdate(projectId, payload, {
        new: true,
    });

    if (project.cover_image && payload.cover_image) {
        deleteFileFromS3(project.cover_image);
    }
    return updatedProject;
};

// Delete Project
const deleteProject = async (userId: string, projectId: string) => {
    const project = await Project.findOne({ _id: projectId, owner: userId });
    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }

    const images = await ProjectImage.find({ project: projectId }).select(
        'image_url'
    );
    for (const img of images) {
        if (img.image_url) {
            await deleteFileFromS3(img.image_url);
        }
    }
    await ProjectImage.deleteMany({ project: projectId });

    const documents = await ProjectDocument.find({ project: projectId }).select(
        'document_url'
    );
    for (const doc of documents) {
        if (doc.document_url) {
            await deleteFileFromS3(doc.document_url);
        }
    }
    await ProjectDocument.deleteMany({ project: projectId });

    await ProjectMember.deleteMany({ project: projectId });
    await ProjectJoinRequest.deleteMany({ project: projectId });

    if (project.cover_image) {
        await deleteFileFromS3(project.cover_image);
    }

    const conversation = await Conversation.findOneAndDelete({
        project: projectId,
    });

    if (conversation) {
        const messages = await Message.find({ conversation: conversation._id });

        const allFiles = [
            ...messages.flatMap((m) => m.imageUrl || []),
            ...messages.flatMap((m) => m.pdfUrl || []),
            ...messages.flatMap((m) => m.videoUrl || []),
        ];

        await Promise.all(allFiles.map((file) => deleteFileFromS3(file)));
        await Message.deleteMany({ conversation: conversation._id });
    }

    const result = await Project.findByIdAndDelete(projectId);

    return result;
};

const ProjectService = {
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject,
};

export default ProjectService;
