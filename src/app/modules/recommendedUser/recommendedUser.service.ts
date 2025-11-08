import QueryBuilder from '../../builder/QueryBuilder';
import { IRecommendedUser } from './recommendedUser.interface';
import { RecommendedUser } from './recommendedUser.model';

const createRecommendedUsers = async (users: IRecommendedUser[]) => {
    const result = await RecommendedUser.insertMany(users);
    return result;
};

const getRecommendedUsers = async (query: Record<string, unknown>) => {
    const AdminQuery = new QueryBuilder(
        RecommendedUser.find().populate('skill'),
        query
    )
        .search(['name', 'email'])
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

const RecommendedUserServices = { createRecommendedUsers, getRecommendedUsers };
export default RecommendedUserServices;
