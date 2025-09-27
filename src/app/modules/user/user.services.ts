/* eslint-disable no-unused-vars */

import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config';
import AppError from '../../error/appError';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import sendEmail from '../../utilities/sendEmail';
import { INormalUser } from '../normalUser/normalUser.interface';
import NormalUser from '../normalUser/normalUser.model';
import SuperAdmin from '../superAdmin/superAdmin.model';
import { USER_ROLE } from './user.constant';
import { TUser, TUserRole } from './user.interface';
import { User } from './user.model';
import { createToken } from './user.utils';
const generateVerifyCode = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};
const registerUser = async (
    payload: INormalUser & { password: string; confirmPassword: string }
) => {
    const { password, confirmPassword, ...userData } = payload;
    if (password !== confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Password and confirm password doesn't match"
        );
    }

    const emailExist = await User.findOne({ email: userData.email });
    if (emailExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const verifyCode = generateVerifyCode();
        const userDataPayload: Partial<TUser> = {
            email: userData?.email,
            password: password,
            role: USER_ROLE.user,
            verifyCode,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const user = await User.create([userDataPayload], { session });

        const normalUserPayload = {
            ...userData,
            user: user[0]._id,
        };
        const result = await NormalUser.create([normalUserPayload], {
            session,
        });

        await User.findByIdAndUpdate(
            user[0]._id,
            { profileId: result[0]._id },
            { session }
        );

        sendEmail({
            email: userData.email,
            subject: 'Activate Your Account',
            html: registrationSuccessEmailBody(
                result[0].name,
                user[0].verifyCode
            ),
        });

        await session.commitTransaction();
        session.endSession();

        return result[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const verifyCode = async (email: string, verifyCode: number) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.codeExpireIn < new Date(Date.now())) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
    }
    if (verifyCode !== user.verifyCode) {
        throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
    }
    const result = await User.findOneAndUpdate(
        { email: email },
        { isVerified: true },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            'Server temporary unable please try again letter'
        );
    }

    // Create JWT tokens
    const jwtPayload = {
        id: result?._id,
        profileId: result?.profileId,
        email: result?.email,
        role: result?.role as TUserRole,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string
    );
    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.jwt_refresh_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
    };
};

const resendVerifyCode = async (email: string) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const verifyCode = generateVerifyCode();
    const updateUser = await User.findOneAndUpdate(
        { email: email },
        {
            verifyCode: verifyCode,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        },
        { new: true, runValidators: true }
    );
    if (!updateUser) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Something went wrong . Please again resend the code after a few second'
        );
    }
    sendEmail({
        email: user.email,
        subject: 'Activate Your Account',
        html: registrationSuccessEmailBody('Dear', updateUser.verifyCode),
    });
    return null;
};

const deleteUserAccount = async (user: JwtPayload, password: string) => {
    const userData = await User.findById(user.id);

    if (!userData) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (!(await User.isPasswordMatched(password, userData?.password))) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
    }

    await NormalUser.findByIdAndDelete(user.profileId);
    await User.findByIdAndDelete(user.id);

    return null;
};

const getMyProfile = async (userData: JwtPayload) => {
    let result = null;
    if (userData.role === USER_ROLE.user) {
        result = await NormalUser.findOne({ email: userData.email });
    } else if (userData.role === USER_ROLE.superAdmin) {
        result = await SuperAdmin.findOne({ email: userData.email });
    }
    return result;
};

// all cron jobs for users---

cron.schedule('*/2 * * * *', async () => {
    try {
        const now = new Date();

        // Find unverified users whose expiration time has passed
        const expiredUsers = await User.find({
            isVerified: false,
            codeExpireIn: { $lte: now },
        });

        if (expiredUsers.length > 0) {
            const expiredUserIds = expiredUsers.map((user) => user._id);

            // Delete corresponding NormalUser documents
            const normalUserDeleteResult = await NormalUser.deleteMany({
                user: { $in: expiredUserIds },
            });

            // Delete the expired User documents
            const userDeleteResult = await User.deleteMany({
                _id: { $in: expiredUserIds },
            });

            console.log(
                `Deleted ${userDeleteResult.deletedCount} expired inactive users`
            );
            console.log(
                `Deleted ${normalUserDeleteResult.deletedCount} associated NormalUser documents`
            );
        }
    } catch (error) {
        console.log('Error deleting expired users and associated data:', error);
    }
});

const changeUserStatus = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const result = await User.findByIdAndUpdate(
        id,
        { isBlocked: !user.isBlocked },
        { new: true, runValidators: true }
    );
    return result;
};
const userServices = {
    registerUser,
    verifyCode,
    resendVerifyCode,
    getMyProfile,
    changeUserStatus,
    deleteUserAccount,
};

export default userServices;
