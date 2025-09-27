import httpStatus from 'http-status';
import AppError from '../../error/appError';
import QueryBuilder from '../../builder/QueryBuilder';
import Relative from './relative.model';
import { IRelative } from './relative.interface';

// Create Relative
const createRelative = async (userId: string, payload: IRelative) => {
    const isExists = await Relative.findOne({
        user: userId,
        relative: payload.relative,
    });
    if (userId == payload.relative.toString()) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You can not add yourself as a relative'
        );
    }
    if (isExists) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You already added this person as relative'
        );
    }
    const result = await Relative.create({ ...payload, user: userId });
    return result;
};

const getAllRelatives = async (
    userId: string,
    query: Record<string, unknown>
) => {
    const relativeQuery = new QueryBuilder(
        Relative.find({ user: userId }).populate({
            path: 'relative',
            select: 'name profile_image',
        }),
        query
    )
        .search(['relation'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await relativeQuery.modelQuery;
    const meta = await relativeQuery.countTotal();

    return {
        meta,
        result,
    };
};

// Get Relative by ID
const getRelativeById = async (relativeId: string) => {
    const relative = await Relative.findById(relativeId)
        .populate('user')
        .populate('relative');
    if (!relative) {
        throw new AppError(httpStatus.NOT_FOUND, 'Relative not found');
    }
    return relative;
};

// Update Relative
const updateRelative = async (
    userId: string,
    relativeId: string,
    payload: Partial<IRelative>
) => {
    const relative = await Relative.findById(relativeId);
    if (!relative) {
        throw new AppError(httpStatus.NOT_FOUND, 'Relative not found');
    }

    const updatedRelative = await Relative.findByIdAndUpdate(
        relativeId,
        payload,
        { new: true }
    );
    return updatedRelative;
};

// Delete Relative----
const deleteRelative = async (userId: string, relativeId: string) => {
    const relative = await Relative.findOne({ user: userId, _id: relativeId });
    if (!relative) {
        throw new AppError(httpStatus.NOT_FOUND, 'Relative not found');
    }
    const result = await Relative.findByIdAndDelete(relativeId);
    return result;
};

const RelativeService = {
    createRelative,
    getAllRelatives,
    getRelativeById,
    updateRelative,
    deleteRelative,
};

export default RelativeService;
