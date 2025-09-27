import httpStatus from 'http-status';
import AppError from '../../error/appError';
import mongoose from 'mongoose';
import { ICategory } from './category.interface';
import Category from './category.model';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import QueryBuilder from '../../builder/QueryBuilder';

// create category into db
const createCategoryIntoDB = async (payload: ICategory) => {
    const category = await Category.findOne({
        name: payload.name,
        testType: payload.testType,
    });
    if (category) {
        if (payload.category_image) {
            deleteCategoryFromDB(payload.category_image);
        }
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `This category already exist for ${payload.testType}`
        );
    }
    const result = await Category.create(payload);
    return result;
};
const updateCategoryIntoDB = async (
    id: string,
    payload: Partial<ICategory>
) => {
    const category = await Category.findOne({ _id: id });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
    const result = await Category.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    if (payload.category_image) {
        if (category.category_image) {
            deleteFileFromS3(category.category_image);
        }
    }
    return result;
};

const getAllCategories = async (query: Record<string, unknown>) => {
    const resultQuery = new QueryBuilder(
        Category.find({ isDeleted: false }),
        query
    )
        .search(['name'])
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

const getSingleCategory = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    return category;
};

// delete category
const deleteCategoryFromDB = async (categoryId: string) => {
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const deletedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { isDeleted: true },
            {
                new: true,

                session,
            }
        );
        await session.commitTransaction();
        session.endSession();

        return deletedCategory;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (error instanceof mongoose.Error) {
            throw new AppError(500, `Mongoose Error: ${error.message}`);
        }
    }
};

const categoryService = {
    createCategoryIntoDB,
    updateCategoryIntoDB,
    getAllCategories,
    getSingleCategory,
    deleteCategoryFromDB,
};

export default categoryService;
