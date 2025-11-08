/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../error/appError';
import { ENUM_PAYMENT_PURPOSE } from '../../utilities/enum';
import paypalClient from '../../utilities/paypal';
import { ENUM_FRIEND_REQUEST_STATUS } from '../friendRequest/friendRequest.enum';
import Relative from '../relative/relative.model';
import { USER_ROLE } from '../user/user.constant';
import { ENUM_SUBSCRIPTION_TYPE } from './normalUser.enum';
import { INormalUser } from './normalUser.interface';
import NormalUser from './normalUser.model';
const updateUserProfile = async (id: string, payload: Partial<INormalUser>) => {
    if (payload.email) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You can not change the email'
        );
    }
    const user = await NormalUser.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
    }
    const result = await NormalUser.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const getAllUser = async (
    userData: JwtPayload,
    query: Record<string, unknown>
) => {
    if (
        userData.role == USER_ROLE.admin ||
        userData.role == USER_ROLE.superAdmin
    ) {
        const userQuery = new QueryBuilder(
            NormalUser.find().populate({ path: 'user', select: 'isBlocked' }),
            query
        )
            .search(['name'])
            .fields()
            .filter()
            .paginate()
            .sort();

        const result = await userQuery.modelQuery;
        const meta = await userQuery.countTotal();
        return {
            meta,
            result,
        };
    } else {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;
        const skip = (page - 1) * limit;
        const searchTerm = query?.searchTerm || '';

        const searchMatchStage: any = searchTerm
            ? {
                  $or: [
                      { name: { $regex: searchTerm, $options: 'i' } },
                      { email: { $regex: searchTerm, $options: 'i' } },
                  ],
              }
            : {};

        const aggResult = await NormalUser.aggregate([
            {
                $match: {
                    ...searchMatchStage,
                    _id: {
                        $ne: new mongoose.Types.ObjectId(userData.profileId),
                    },
                },
            },
            {
                $lookup: {
                    from: 'friendrequests',
                    let: { otherUserId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$sender',
                                                        '$$otherUserId',
                                                    ],
                                                },
                                                {
                                                    $eq: [
                                                        '$receiver',
                                                        new mongoose.Types.ObjectId(
                                                            userData.profileId
                                                        ),
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$receiver',
                                                        '$$otherUserId',
                                                    ],
                                                },
                                                {
                                                    $eq: [
                                                        '$sender',
                                                        new mongoose.Types.ObjectId(
                                                            userData.profileId
                                                        ),
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'friendRequests',
                },
            },
            {
                $addFields: {
                    friendRequestStatus: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $anyElementTrue: {
                                            $map: {
                                                input: '$friendRequests',
                                                as: 'req',
                                                in: {
                                                    $eq: [
                                                        '$$req.status',
                                                        ENUM_FRIEND_REQUEST_STATUS.Accepted,
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    then: 'friend',
                                },
                                {
                                    case: {
                                        $anyElementTrue: {
                                            $map: {
                                                input: '$friendRequests',
                                                as: 'req',
                                                in: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                '$$req.sender',
                                                                new mongoose.Types.ObjectId(
                                                                    userData.profileId
                                                                ),
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                '$$req.status',
                                                                ENUM_FRIEND_REQUEST_STATUS.Pending,
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    // then: 'following_pending',
                                    then: 'following',
                                },
                                {
                                    case: {
                                        $anyElementTrue: {
                                            $map: {
                                                input: '$friendRequests',
                                                as: 'req',
                                                in: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                '$$req.receiver',
                                                                new mongoose.Types.ObjectId(
                                                                    userData.profileId
                                                                ),
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                '$$req.status',
                                                                ENUM_FRIEND_REQUEST_STATUS.Pending,
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    // then: 'follower_pending',
                                    then: 'follower',
                                },
                                {
                                    case: {
                                        $anyElementTrue: {
                                            $map: {
                                                input: '$friendRequests',
                                                as: 'req',
                                                in: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                '$$req.sender',
                                                                new mongoose.Types.ObjectId(
                                                                    userData.profileId
                                                                ),
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                '$$req.status',
                                                                ENUM_FRIEND_REQUEST_STATUS.Rejected,
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    // then: 'following_rejected',
                                    then: 'following',
                                },
                                {
                                    case: {
                                        $anyElementTrue: {
                                            $map: {
                                                input: '$friendRequests',
                                                as: 'req',
                                                in: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                '$$req.receiver',
                                                                new mongoose.Types.ObjectId(
                                                                    userData.profileId
                                                                ),
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                '$$req.status',
                                                                ENUM_FRIEND_REQUEST_STATUS.Rejected,
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    // then: 'follower_rejected',
                                    then: 'follower',
                                },
                            ],
                            default: 'none',
                        },
                    },
                },
            },
            {
                $project: { friendRequests: 0 }, // remove friendRequests array
            },
            {
                $facet: {
                    meta: [
                        { $count: 'total' },
                        {
                            $addFields: {
                                page,
                                limit,
                                totalPages: {
                                    $ceil: { $divide: ['$total', limit] },
                                },
                            },
                        },
                    ],
                    data: [{ $skip: skip }, { $limit: limit }],
                },
            },
            {
                $project: {
                    meta: { $arrayElemAt: ['$meta', 0] },
                    data: 1,
                },
            },
        ]);

        return {
            meta: aggResult[0]?.meta || {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
            result: aggResult[0]?.data || [],
        };
    }
};

// get single user
const getSingleUser = async (profileId: string, id: string) => {
    const user = await getSingleUserWithStatus(profileId, id);
    const relatives = await Relative.find({ user: user._id }).populate({
        path: 'relative',
        select: 'name profile_image',
    });
    return {
        ...user,
        relatives,
    };
};

export async function getSingleUserWithStatus(
    currentProfileId: string,
    targetUserId: string
) {
    if (!mongoose.Types.ObjectId.isValid(currentProfileId)) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid current profile id'
        );
    }
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid user id');
    }

    const currentId = new mongoose.Types.ObjectId(currentProfileId);
    const targetId = new mongoose.Types.ObjectId(targetUserId);

    const pipeline: any = [
        // Match the target user (do NOT exclude self here; if you want to, add {_id: {$ne: currentId}})
        { $match: { _id: targetId } },

        // Find friend requests between current user and target user (both directions)
        {
            $lookup: {
                from: 'friendrequests',
                let: { otherUserId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    // other -> current
                                    {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$sender',
                                                    '$$otherUserId',
                                                ],
                                            },
                                            { $eq: ['$receiver', currentId] },
                                        ],
                                    },
                                    // current -> other
                                    {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$receiver',
                                                    '$$otherUserId',
                                                ],
                                            },
                                            { $eq: ['$sender', currentId] },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    // (Optional) project only needed fields to reduce memory
                    { $project: { status: 1, sender: 1, receiver: 1, _id: 0 } },
                ],
                as: 'friendRequests',
            },
        },

        // Derive friendRequestStatus (same ordering/precedence you used)
        {
            $addFields: {
                friendRequestStatus: {
                    $switch: {
                        branches: [
                            // If there's any Accepted request in either direction => "friend"
                            {
                                case: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: '$friendRequests',
                                            as: 'req',
                                            in: {
                                                $eq: [
                                                    '$$req.status',
                                                    ENUM_FRIEND_REQUEST_STATUS.Accepted,
                                                ],
                                            },
                                        },
                                    },
                                },
                                then: 'friend',
                            },

                            // If current -> other with Pending => "following"
                            {
                                case: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: '$friendRequests',
                                            as: 'req',
                                            in: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            '$$req.sender',
                                                            currentId,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            '$$req.status',
                                                            ENUM_FRIEND_REQUEST_STATUS.Pending,
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                then: 'following',
                            },

                            // If other -> current with Pending => "follower"
                            {
                                case: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: '$friendRequests',
                                            as: 'req',
                                            in: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            '$$req.receiver',
                                                            currentId,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            '$$req.status',
                                                            ENUM_FRIEND_REQUEST_STATUS.Pending,
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                then: 'follower',
                            },

                            // If current -> other with Rejected => "following" (your current logic)
                            {
                                case: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: '$friendRequests',
                                            as: 'req',
                                            in: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            '$$req.sender',
                                                            currentId,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            '$$req.status',
                                                            ENUM_FRIEND_REQUEST_STATUS.Rejected,
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                then: 'following',
                            },

                            // If other -> current with Rejected => "follower" (your current logic)
                            {
                                case: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: '$friendRequests',
                                            as: 'req',
                                            in: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            '$$req.receiver',
                                                            currentId,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            '$$req.status',
                                                            ENUM_FRIEND_REQUEST_STATUS.Rejected,
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                then: 'follower',
                            },
                        ],
                        default: 'none',
                    },
                },
            },
        },

        // Don’t leak the raw requests array
        { $project: { friendRequests: 0 } },
    ] as const;

    const [doc] = await NormalUser.aggregate(pipeline).exec();

    if (!doc) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return doc;
}

const purchaseSubscription = async (profileId: string, type: string) => {
    const user = await NormalUser.findById(profileId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    let totalAmount;
    if (type == ENUM_SUBSCRIPTION_TYPE.Standard) {
        totalAmount = 10;
    } else {
        totalAmount = 25;
    }

    try {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: totalAmount.toFixed(2),
                    },
                    description: `Payment for subscription: ${type}`,
                    custom_id: user._id.toString(),
                    reference_id: ENUM_PAYMENT_PURPOSE.SUBSCRIPTION,
                },
            ],
            application_context: {
                brand_name: 'Your Business Name',
                landing_page: 'LOGIN',
                user_action: 'PAY_NOW',
                return_url: `${config.paypal.payment_capture_url}`,
                cancel_url: `${config.paypal.donation_cancel_url}`,
            },
        });

        const response = await paypalClient.execute(request);
        const approvalUrl = response.result.links.find(
            (link: any) => link.rel === 'approve'
        )?.href;

        if (!approvalUrl) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'PayPal payment creation failed: No approval URL found'
            );
        }

        return { url: approvalUrl };
    } catch (error) {
        console.error('PayPal Payment Error:', error);
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to create PayPal order'
        );
    }
};

const NormalUserServices = {
    updateUserProfile,
    getAllUser,
    getSingleUser,
    purchaseSubscription,
};

export default NormalUserServices;
