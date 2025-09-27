/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { ILoginWithGoogle, TUser, TUserRole } from '../user/user.interface';
import { createToken, verifyToken } from '../user/user.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import resetPasswordEmailBody from '../../mailTemplate/resetPasswordEmailBody';
import sendEmail from '../../utilities/sendEmail';
import mongoose from 'mongoose';
import { USER_ROLE } from '../user/user.constant';
import NormalUser from '../normalUser/normalUser.model';
import appleSigninAuth from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import axios from 'axios';
const generateVerifyCode = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};
const loginUserIntoDB = async (payload: TLoginUser) => {
    const user = await User.findOne({ email: payload.email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }
    if (!user.isVerified) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not verified user . Please verify your email'
        );
    }
    // checking if the password is correct ----
    if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
    }
    const jwtPayload = {
        id: user?._id,
        profileId: user.profileId,
        email: user?.email,
        role: user?.role as TUserRole,
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

const loginWithGoogle = async (payload: ILoginWithGoogle) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if the user already exists
        const isExistUser = await User.findOne(
            { email: payload.email },
            { isVerified: true }
        ).session(session);

        // If user exists, create JWT and return tokens
        if (isExistUser) {
            const jwtPayload = {
                id: isExistUser._id,
                profileId: isExistUser.profileId,
                email: isExistUser.email,
                role: isExistUser.role as TUserRole,
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

            await session.commitTransaction();
            session.endSession();
            return { accessToken, refreshToken };
        }

        // If user doesn't exist, create a new user
        const userDataPayload: Partial<TUser> = {
            email: payload.email,
            phone: payload?.phone,
            role: USER_ROLE.user,
        };

        const createUser = await User.create([userDataPayload], { session });

        const normalUserData = {
            name: payload.name,
            email: payload.email,
            profile_image: payload.profile_image,
            user: createUser[0]._id,
        };

        await NormalUser.create([normalUserData], {
            session,
        });

        // Create JWT tokens
        const jwtPayload = {
            id: createUser[0]._id,
            profileId: createUser[0].profileId,
            email: createUser[0].email,
            role: createUser[0].role as TUserRole,
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

        await session.commitTransaction();
        session.endSession();

        return { accessToken, refreshToken };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// change password
const changePasswordIntoDB = async (
    userData: JwtPayload,
    payload: {
        oldPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }
) => {
    if (payload.newPassword !== payload.confirmNewPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Password and confirm password doesn't match"
        );
    }
    const user = await User.findById(userData.id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }

    if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
    }
    //hash new password
    const newHashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds)
    );
    await User.findOneAndUpdate(
        {
            _id: userData.id,
            role: userData.role,
        },
        {
            password: newHashedPassword,
            passwordChangedAt: new Date(),
        }
    );

    const jwtPayload = {
        id: user?._id,
        profileId: user.profileId,
        email: user?.email,
        role: user?.role as TUserRole,
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

const refreshToken = async (token: string) => {
    const decoded = verifyToken(token, config.jwt_refresh_secret as string);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username, email, iat, id } = decoded;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }
    if (
        user?.passwordChangedAt &&
        (await User.isJWTIssuedBeforePasswordChange(
            user?.passwordChangedAt,
            iat as number
        ))
    ) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
    }
    const jwtPayload = {
        id: user?._id,
        profileId: user?.profileId,
        email: user?.email,
        role: user?.role as TUserRole,
    };
    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string
    );
    return { accessToken };
};

// forgot password
const forgetPassword = async (email: string) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }

    const resetCode = generateVerifyCode();
    await User.findOneAndUpdate(
        { email: email },
        {
            resetCode: resetCode,
            isResetVerified: false,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        }
    );

    // sendEmail(
    //   user.email,
    //   'Reset password code',
    //   resetPasswordEmailBody(user.username, resetCode),
    // );
    sendEmail({
        email: user.email,
        subject: 'Reset password code',
        html: resetPasswordEmailBody('Dear', resetCode),
    });

    return null;

    // const jwtPayload = {
    //   id: user?._id,
    //   email: user?.email,
    //   role: user?.role as TUserRole,
    // };
    // const resetToken = createToken(
    //   jwtPayload,
    //   config.jwt_access_secret as string,
    //   '10m',
    // );
    // const resetUiLink = `${config.reset_password_ui_link}?${user._id}&token=${resetToken}`;
    // const emailContent = generateResetPasswordEmail(resetUiLink);

    // // Send the email
    // sendEmail(user?.email, 'Reset your password within 10 mins!', emailContent);
};

// verify forgot otp

const verifyResetOtp = async (email: string, resetCode: number) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }

    if (user.codeExpireIn < new Date(Date.now())) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Reset code is expire');
    }
    if (user.resetCode !== Number(resetCode)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Reset code is invalid');
    }
    await User.findOneAndUpdate(
        { email: email },
        { isResetVerified: true },
        { new: true, runValidators: true }
    );
    return null;
};

// reset password
const resetPassword = async (payload: {
    email: string;
    password: string;
    confirmPassword: string;
}) => {
    if (payload.password !== payload.confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Password and confirm password doesn't match"
        );
    }
    const user = await User.findOne({ email: payload.email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (!user.isResetVerified) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You need to verify reset code before reset password'
        );
    }

    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }
    // verify token -------------
    // const decoded = jwt.verify(
    //   token,
    //   config.jwt_access_secret as string,
    // ) as JwtPayload;
    // // console.log(decoded.userId, payload.id);
    // if (decoded?.userId !== payload?.email) {
    //   throw new AppError(
    //     httpStatus.FORBIDDEN,
    //     'You are forbidden to access this',
    //   );
    // }

    //hash new password
    const newHashedPassword = await bcrypt.hash(
        payload.password,
        Number(config.bcrypt_salt_rounds)
    );
    // update the new password
    await User.findOneAndUpdate(
        {
            email: payload.email,
        },
        {
            password: newHashedPassword,
            passwordChangedAt: new Date(),
        }
    );
    const jwtPayload = {
        id: user?._id,
        profileId: user?.profileId,
        email: user?.email,
        role: user?.role as TUserRole,
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

    return { accessToken, refreshToken };
};

const resendResetCode = async (email: string) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }

    const resetCode = generateVerifyCode();
    await User.findOneAndUpdate(
        { email: email },
        {
            resetCode: resetCode,
            isResetVerified: false,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        }
    );
    sendEmail({
        email: user.email,
        subject: 'Reset password code',
        html: resetPasswordEmailBody('Dear', resetCode),
    });

    return null;
};
const resendVerifyCode = async (email: string) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    if (user.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'This user is already deleted'
        );
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }

    const verifyCode = generateVerifyCode();
    await User.findOneAndUpdate(
        { email: email },
        {
            verifyCode: verifyCode,
            isVerified: false,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        }
    );
    sendEmail({
        email: user.email,
        subject: 'Reset password code',
        html: resetPasswordEmailBody('Dear', verifyCode),
    });

    return null;
};

const loginWithOAuth = async (
    provider: string,
    token: string,
    role: TUserRole
) => {
    let email, id, name, picture;

    try {
        if (provider === 'google') {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token');
            }
            email = payload.email!;
            id = payload.sub;
            name = payload.name!;
            picture = payload.picture!;
        } else if (provider === 'facebook') {
            const response: any = await axios.get(
                `https://graph.facebook.com/me?fields=id,email,name,picture&access_token=${token}`
            );
            email = response.data.email;
            id = response.data.id;
            name = response.data.name;
            picture = response.data.picture.data.url;
        } else if (provider === 'apple') {
            const appleUser = await appleSigninAuth.verifyIdToken(token, {
                audience: process.env.APPLE_CLIENT_ID!,
                ignoreExpiration: false,
            });
            email = appleUser.email;
            id = appleUser.sub;
            name = 'Apple User';
        } else {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Invalid token, Please try again'
            );
        }

        let user = await User.findOne({ [`${provider}Id`]: id });

        if (!user) {
            user = new User({
                email,
                [`${provider}Id`]: id,
                name,
                profilePic: picture,
                role,
            });
            await user.save();

            const result = await NormalUser.create({
                user: user._id,
                email: email,
                profile_image: picture,
            });
            const updatedUser = await User.findByIdAndUpdate(user._id, {
                profileId: result._id,
            });
            user = updatedUser;
        }
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'user not found');
        }

        const jwtPayload = {
            id: user?._id,
            profileId: user?.profileId,
            email: user?.email,
            role: user?.role as TUserRole,
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

        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Something went wrong'
        );
    }
};

const authServices = {
    loginUserIntoDB,
    changePasswordIntoDB,
    refreshToken,
    forgetPassword,
    resetPassword,
    verifyResetOtp,
    resendResetCode,
    loginWithGoogle,
    resendVerifyCode,
    loginWithOAuth,
};

export default authServices;
