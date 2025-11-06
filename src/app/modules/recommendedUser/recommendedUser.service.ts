import { IRecommendedUser } from './recommendedUser.interface';
import { RecommendedUser } from './recommendedUser.model';

const createRecommendedUsers = async (users: IRecommendedUser[]) => {
    const result = await RecommendedUser.insertMany(users);
    return result;
};

const RecommendedUserServices = { createRecommendedUsers };
export default RecommendedUserServices;
