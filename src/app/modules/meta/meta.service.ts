/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENUM_PAYMENT_STATUS } from '../../utilities/enum';
import Audio from '../audio/audio.model';
import { ENUM_BOND_LINK_STATUS } from '../bondLink/bondLink.enum';
import { BondLink } from '../bondLink/bondLink.model';
import { Donate } from '../donate/donate.model';
import Institution from '../institution/institution.model';
import NormalUser from '../normalUser/normalUser.model';
import { User } from '../user/user.model';

const getDashboardMetaData = async () => {
    const [totalUser, totalBlockAccount, donationStats] = await Promise.all([
        NormalUser.countDocuments(),
        User.countDocuments({ isBlocked: true }),
        Donate.aggregate([
            {
                $match: { status: ENUM_PAYMENT_STATUS.PAID },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    uniqueDonors: { $addToSet: '$user' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalAmount: 1,
                    totalUniqueDonors: { $size: '$uniqueDonors' },
                },
            },
        ]),
    ]);

    const { totalAmount = 0, totalUniqueDonors = 0 } = donationStats[0] || {};

    return {
        totalUser,
        totalBlockAccount,
        totalDonationAmount: totalAmount,
        totalDonors: totalUniqueDonors,
    };
};

const getUserChartData = async (year: number) => {
    const currentYear = year || new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const chartData = await NormalUser.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalUser: { $sum: 1 },
            },
        },
        {
            $project: {
                month: '$_id',
                totalUser: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const data = Array.from({ length: 12 }, (_, index) => ({
        month: months[index],
        totalUser:
            chartData.find((item) => item.month === index + 1)?.totalUser || 0,
    }));

    const yearsResult = await NormalUser.aggregate([
        {
            $group: {
                _id: { $year: '$createdAt' },
            },
        },
        {
            $project: {
                year: '$_id',
                _id: 0,
            },
        },
        {
            $sort: { year: 1 },
        },
    ]);

    const yearsDropdown = yearsResult.map((item: any) => item.year);

    return {
        chartData: data,
        yearsDropdown,
    };
};

// const getInstitutionChartData = async (year: number) => {
//     const currentYear = year || new Date().getFullYear();
//     const startOfYear = new Date(currentYear, 0, 1);
//     const endOfYear = new Date(currentYear + 1, 0, 1);
//     const chartData = await Institution.aggregate([
//         {
//             $match: {
//                 createdAt: {
//                     $gte: startOfYear,
//                     $lt: endOfYear,
//                 },
//             },
//         },
//         {
//             $lookup: {
//                 from: 'institutionmembers',
//                 localField: '_id',
//                 foreignField: 'institution',
//                 as: 'members',
//             },
//         },
//         {
//             $addFields: {
//                 memberCount: { $size: '$members' },
//             },
//         },

//         {
//             $addFields: {
//                 avgMembersPerInstitution: {
//                     $cond: [
//                         { $eq: ['$totalInstitutions', 0] },
//                         0,
//                         { $divide: ['$totalMembers', '$totalInstitutions'] },
//                     ],
//                 },
//             },
//         },
//         {
//             $group: {
//                 _id: { $month: '$createdAt' },
//                 totalInstitutions: { $sum: 1 },
//                 totalMembers: { $sum: '$memberCount' },
//                 avgMembersPerInstitution: { $sum: 1 },
//             },
//         },
//         {
//             $project: {
//                 month: '$_id',
//                 totalInstitutions: 1,
//                 totalMembers: 1,
//                 avgMembersPerInstitution: 1,
//                 _id: 0,
//             },
//         },
//         {
//             $sort: { _id: 1 },
//         },
//     ]);

//     const months = [
//         'Jan',
//         'Feb',
//         'Mar',
//         'Apr',
//         'May',
//         'Jun',
//         'Jul',
//         'Aug',
//         'Sep',
//         'Oct',
//         'Nov',
//         'Dec',
//     ];

//     const data = Array.from({ length: 12 }, (_, index) => ({
//         month: months[index],
//         totalInstitutions:
//             chartData.find((item) => item.month === index + 1)
//                 ?.totalInstitutions || 0,
//         totalMembers:
//             chartData.find((item) => item.month === index + 1)?.totalMembers ||
//             0,
//         avgMembersPerInstitution:
//             chartData.find((item) => item.month === index + 1)
//                 ?.avgMembersPerInstitution || 0,
//     }));

//     const yearsResult = await Donate.aggregate([
//         {
//             $group: {
//                 _id: { $year: '$createdAt' },
//             },
//         },
//         {
//             $project: {
//                 year: '$_id',
//                 _id: 0,
//             },
//         },
//         {
//             $sort: { year: 1 },
//         },
//     ]);

//     const yearsDropdown = yearsResult.map((item: any) => item.year);

//     return {
//         chartData: data,
//         yearsDropdown,
//     };
// };

const getInstitutionChartData = async (year?: number) => {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const chartAgg = await Institution.aggregate([
        { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },

        // Efficient lookup that returns a count for each institution
        {
            $lookup: {
                from: 'institutionmembers',
                let: { instId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$institution', '$$instId'] },
                        },
                    },
                    { $count: 'count' },
                ],
                as: 'memberCounts',
            },
        },
        {
            $addFields: {
                memberCount: {
                    $ifNull: [{ $arrayElemAt: ['$memberCounts.count', 0] }, 0],
                },
            },
        },

        // Group by month and sum members/institutions
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalInstitutions: { $sum: 1 },
                totalMembers: { $sum: '$memberCount' },
            },
        },

        // Compute average after grouping; round to 2 decimals
        {
            $project: {
                month: '$_id',
                totalInstitutions: 1,
                totalMembers: 1,
                avgMembersPerInstitution: {
                    $cond: [
                        { $eq: ['$totalInstitutions', 0] },
                        0,
                        {
                            $round: [
                                {
                                    $divide: [
                                        '$totalMembers',
                                        '$totalInstitutions',
                                    ],
                                },
                                2,
                            ],
                        },
                    ],
                },
                _id: 0,
            },
        },

        // Sort by month number
        { $sort: { month: 1 } },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const data = months.map((m, i) => {
        const found = chartAgg.find((c: any) => c.month === i + 1) || {
            totalInstitutions: 0,
            totalMembers: 0,
            avgMembersPerInstitution: 0,
        };
        return {
            month: m,
            totalInstitutions: found.totalInstitutions,
            totalMembers: found.totalMembers,
            avgMembersPerInstitution: found.avgMembersPerInstitution,
        };
    });

    // Years dropdown from Institution (not Donate)
    const yearsResult = await Institution.aggregate([
        { $group: { _id: { $year: '$createdAt' } } },
        { $project: { year: '$_id', _id: 0 } },
        { $sort: { year: 1 } },
    ]);
    const yearsDropdown = yearsResult.map((r: any) => r.year);

    return { chartData: data, yearsDropdown };
};

const donorGrowthChartData = async (year: number) => {
    const currentYear = year || new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const chartData = await Donate.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalDonate: { $sum: 1 },
            },
        },
        {
            $project: {
                month: '$_id',
                totalDonate: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const data = Array.from({ length: 12 }, (_, index) => ({
        month: months[index],
        totalDonate:
            chartData.find((item) => item.month === index + 1)?.totalDonate ||
            0,
    }));

    const yearsResult = await Donate.aggregate([
        {
            $group: {
                _id: { $year: '$createdAt' },
            },
        },
        {
            $project: {
                year: '$_id',
                _id: 0,
            },
        },
        {
            $sort: { year: 1 },
        },
    ]);

    const yearsDropdown = yearsResult.map((item: any) => item.year);

    return {
        chartData: data,
        yearsDropdown,
    };
};

const bondChartData = async (year: number) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const result = await BondLink.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfYear, $lt: endOfYear },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    let total = 0;
    let ongoing = 0;
    let completed = 0;
    let canceled = 0;

    result.forEach((item) => {
        total += item.count;
        if (item._id === ENUM_BOND_LINK_STATUS.Ongoing) ongoing = item.count;
        if (item._id === ENUM_BOND_LINK_STATUS.Completed)
            completed = item.count;
        if (item._id === ENUM_BOND_LINK_STATUS.Canceled) canceled = item.count;
    });

    const chartData = await BondLink.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                total: { $sum: 1 },
                ongoing: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', ENUM_BOND_LINK_STATUS.Ongoing] },
                            1,
                            0,
                        ],
                    },
                },
                completed: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$status',
                                    ENUM_BOND_LINK_STATUS.Completed,
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                canceled: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$status',
                                    ENUM_BOND_LINK_STATUS.Canceled,
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $project: {
                month: '$_id',
                total: 1,
                ongoing: 1,
                completed: 1,
                canceled: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    // Fill missing months with 0 values
    const data = Array.from({ length: 12 }, (_, index) => {
        const found = chartData.find((item) => item.month === index + 1);
        return {
            month: months[index],
            total: found?.total || 0,
            ongoing: found?.ongoing || 0,
            completed: found?.completed || 0,
            canceled: found?.canceled || 0,
        };
    });

    // Distinct years dropdown
    const yearsResult = await BondLink.aggregate([
        {
            $group: {
                _id: { $year: '$createdAt' },
            },
        },
        {
            $project: {
                year: '$_id',
                _id: 0,
            },
        },
        { $sort: { year: 1 } },
    ]);

    const yearsDropdown = yearsResult.map((item: any) => item.year);

    return {
        total,
        ongoing,
        completed,
        canceled,
        chartData: data,
        yearsDropdown,
    };
};

const getAudioPieChartData = async () => {
    const audioStats = await Audio.aggregate([
        {
            $group: {
                _id: null,
                shortAudioCount: {
                    $sum: { $cond: [{ $lt: ['$duration', 300] }, 1, 0] },
                },
                longAudioCount: {
                    $sum: { $cond: [{ $gte: ['$duration', 300] }, 1, 0] },
                },
                totalCount: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                shortAudioCount: 1,
                longAudioCount: 1,
                totalCount: 1,
            },
        },
    ]);
    const stats = audioStats[0] || {
        shortAudioCount: 0,
        longAudioCount: 0,
        totalCount: 0,
    };

    return stats;
};

// get instation chart
const getEarningChartData = async (year: number) => {
    const currentYear = year || new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const chartData = await Donate.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
                status: ENUM_PAYMENT_STATUS.PAID,
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalEarning: { $sum: '$amount' }, // Sum amounts
            },
        },
        {
            $project: {
                month: '$_id',
                totalEarning: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const data = Array.from({ length: 12 }, (_, index) => ({
        month: months[index],
        totalEarning:
            chartData.find((item) => item.month === index + 1)?.totalEarning ||
            0,
    }));

    const yearsResult = await Donate.aggregate([
        {
            $match: { status: ENUM_PAYMENT_STATUS.PAID },
        },
        {
            $group: {
                _id: { $year: '$createdAt' },
            },
        },
        {
            $project: {
                year: '$_id',
                _id: 0,
            },
        },
        {
            $sort: { year: 1 },
        },
    ]);

    const yearsDropdown = yearsResult.map((item: any) => item.year);

    return {
        chartData: data,
        yearsDropdown,
    };
};

const MetaService = {
    getDashboardMetaData,
    getUserChartData,
    getAudioPieChartData,
    donorGrowthChartData,
    getInstitutionChartData,
    bondChartData,
    getEarningChartData,
};

export default MetaService;
