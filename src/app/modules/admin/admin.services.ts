/* eslint-disable @typescript-eslint/no-explicit-any */

import QueryBuilder from '../../builder/QueryBuilder';

import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../error/appError';
import { USER_ROLE } from '../user/user.constant';
import { TUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { IAdmin } from './admin.interface';
import Admin from './admin.model';

// register Admin
const createAdmin = async (payload: IAdmin & { password: string }) => {
    const { password, ...adminData } = payload;
    const admin = await User.isUserExists(adminData?.email);
    if (admin) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This admin already exists');
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userData: Partial<TUser> = {
            email: adminData?.email,
            phone: adminData?.phoneNumber,
            password: password,
            role: USER_ROLE.admin,
            isActive: true,
            isVerified: true,
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const user = await User.create([userData], { session });

        const adminPayload = {
            ...adminData,
            user: user[0]._id,
        };
        const admin = await Admin.create([adminPayload], { session });
        await User.findByIdAndUpdate(
            user[0]._id,
            { profileId: admin[0]._id },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return admin[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const updateAdminProfile = async (
    id: string,
    payload: Partial<IAdmin> & { password: string }
) => {
    if (payload.password) {
        const hashedPassword = await bcrypt.hash(
            payload.password,
            Number(config.bcrypt_salt_rounds)
        );
        await User.findOneAndUpdate(
            { profileId: id },
            { password: hashedPassword }
        );
    }
    const result = await Admin.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteAdminFromDB = async (id: string) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const admin = await Admin.findById(id).session(session);
        if (!admin) {
            throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');
        }

        // Delete associated User and Admin within the transaction
        await User.findByIdAndDelete(admin.user).session(session);
        await Admin.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        return null;
    } catch (error) {
        await session.abortTransaction();
        throw error; // re-throw the error for further handling
    } finally {
        session.endSession();
    }
};

// get all Admin

const getAllAdminFromDB = async (query: Record<string, any>) => {
    const AdminQuery = new QueryBuilder(
        Admin.find().populate({ path: 'user', select: 'isBlocked' }),
        query
    )
        .search(['name'])
        .fields()
        .filter()
        .paginate()
        .sort();
    const meta = await AdminQuery.countTotal();
    const result = await AdminQuery.modelQuery;

    return {
        meta,
        result,
    };
};

const getSingleAdmin = async (id: string) => {
    const result = await Admin.findById(id).populate({
        path: 'user',
        select: 'isBlocked',
    });
    return result;
};

const AdminServices = {
    createAdmin,
    updateAdminProfile,
    getAllAdminFromDB,
    deleteAdminFromDB,
    getSingleAdmin,
};

export default AdminServices;
