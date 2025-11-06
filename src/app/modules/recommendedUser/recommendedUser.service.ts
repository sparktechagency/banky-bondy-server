import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IRecommendedUser } from "./recommendedUser.interface";
import recommendedUserModel from "./recommendedUser.model";

const updateUserProfile = async (id: string, payload: Partial<IRecommendedUser>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await recommendedUserModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await recommendedUserModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const RecommendedUserServices = { updateUserProfile };
export default RecommendedUserServices;