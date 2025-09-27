/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import Institution from '../institution/institution.model';
import InstitutionMember from '../institutionMember/institutionMember.model';
import { IInstitutionConversation } from './institutionConversation.interface';
import InstitutionConversation from './institutionConversation.model';

// Create
const createInstitutionConversation = async (
    userId: string,
    payload: IInstitutionConversation
) => {
    const institution = await Institution.findById(payload.institution);
    if (!institution) {
        throw new AppError(httpStatus.NOT_FOUND, 'Inititution not found');
    }
    if (institution.creator.toString() != userId) {
        const member = await InstitutionMember.findOne({
            user: userId,
            institution: payload.institution,
        });
        if (!member) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'You are not in that institution'
            );
        }
    }
    const result = await InstitutionConversation.create({
        ...payload,
        user: userId,
    });
    return result;
};

// Get All
// const getAllInstitutionConversations = async (instituionId: string) => {
//     return await InstitutionConversation.find({ institution: instituionId })
//         .populate({ path: 'user', select: 'name' })
//         // .populate('ussers')
//         .populate('likers');
// };
const getAllInstitutionConversations = async (
    instituionId: string,
    profileId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const aggResult: any = await InstitutionConversation.aggregate([
        {
            $match: {
                institution: new mongoose.Types.ObjectId(instituionId),
                $or: [
                    { isPublic: true },
                    { ussers: new mongoose.Types.ObjectId(profileId) },
                    { user: new mongoose.Types.ObjectId(profileId) },
                ],
            },
        },
        {
            $addFields: {
                isMyConversation: {
                    $eq: ['$user', new mongoose.Types.ObjectId(profileId)],
                },
                totalUser: {
                    $size: '$ussers',
                },
                totalLiker: {
                    $size: '$likers',
                },
            },
        },

        { $sort: { createdAt: -1 } },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);

    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.totalCount[0]?.total || 0;
    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        result,
    };
};

// Get Single
const getInstitutionConversationById = async (id: string) => {
    const result = await InstitutionConversation.findById(id)
        .populate({ path: 'user', select: 'name' })
        // .populate('ussers')
        .populate('likers');
    if (!result)
        throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
    return result;
};

// Update
const updateInstitutionConversation = async (
    userId: string,
    id: string,
    payload: Partial<IInstitutionConversation>
) => {
    const conversation = await InstitutionConversation.findById(id);
    if (!conversation) {
        throw new AppError(httpStatus.NOT_FOUND, 'Convsersation not found');
    }
    const institution = await Institution.findById(conversation.institution);
    if (!institution) {
        throw new AppError(httpStatus.NOT_FOUND, 'Institution not found');
    }
    if (
        institution.creator.toString() != userId &&
        conversation.user.toString() != userId
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You don't have permission for update this conversation"
        );
    }
    const result = await InstitutionConversation.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
        }
    );
    return result;
};

// Delete
const deleteInstitutionConversation = async (userId: string, id: string) => {
    const conversation = await InstitutionConversation.findById(id);
    if (!conversation) {
        throw new AppError(httpStatus.NOT_FOUND, 'Convsersation not found');
    }
    const institution = await Institution.findById(conversation.institution);
    if (!institution) {
        throw new AppError(httpStatus.NOT_FOUND, 'Institution not found');
    }
    if (
        institution.creator.toString() != userId &&
        conversation.user.toString() != userId
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You don't have permission for update this conversation"
        );
    }
    const result = await InstitutionConversation.findByIdAndDelete(id);
    if (!result)
        throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
    return result;
};

const InstitutionConversationService = {
    createInstitutionConversation,
    getAllInstitutionConversations,
    getInstitutionConversationById,
    updateInstitutionConversation,
    deleteInstitutionConversation,
};

export default InstitutionConversationService;
