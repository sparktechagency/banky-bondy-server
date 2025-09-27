/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import InstitutionMember from './institutionMember.model';
import { Types } from 'mongoose';
import Institution from '../institution/institution.model';
const getAllInstitutionMember = async (
    institutionId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

    const matchStage: any = {
        institution: new Types.ObjectId(institutionId),
    };

    if (query.group) {
        matchStage.group = query.group;
    }

    if (query.designation) {
        matchStage.designation = query.designation;
    }

    const searchMatchStage = searchTerm
        ? {
              'user.name': { $regex: searchTerm, $options: 'i' },
          }
        : {};

    const pipeline: any[] = [
        {
            $match: matchStage,
        },
        {
            $lookup: {
                from: 'normalusers',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: '$user',
        },
        {
            $match: searchMatchStage,
        },
        {
            $facet: {
                meta: [{ $count: 'total' }],

                result: [
                    {
                        $project: {
                            _id: 1,
                            project: 1,
                            group: 1,
                            designation: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            user: {
                                _id: '$user._id',
                                name: '$user.name',
                                profile_image: '$user.profile_image',
                            },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ],
            },
        },
    ];

    const aggResult = await InstitutionMember.aggregate(pipeline);
    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.meta?.[0]?.total ?? 0;

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

const removeMember = async (userId: string, id: string) => {
    const member = await InstitutionMember.findById(id);
    if (!member) {
        throw new AppError(httpStatus.NOT_FOUND, 'Member not found');
    }

    const institution = await Institution.findById(member.institution).select(
        '_id creator'
    );
    if (!institution) {
        throw new AppError(httpStatus.NOT_FOUND, 'Institution not found');
    }
    if (institution.creator.toString() != userId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You don't have permission for remove member"
        );
    }

    const result = await InstitutionMember.findByIdAndDelete(id);
    return result;
};

const InstitutionMemberServices = { getAllInstitutionMember, removeMember };
export default InstitutionMemberServices;
