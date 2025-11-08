/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { IPlaylist } from './playlist.interface';
import Playlist from './playlist.model';

// Create Playlist
const createPlaylist = async (userId: string, payload: IPlaylist) => {
    const result = await Playlist.create({ ...payload, user: userId });
    return result;
};

// Get All Playlists with QueryBuilder
// const getAllPlaylists = async (query: Record<string, unknown>) => {
//     const playlistQuery = new QueryBuilder(
//         Playlist.find().populate({
//             path: 'user',
//             select: 'name profile_image',
//         }),
//         // .populate('audios'),
//         query
//     )
//         .search(['name', 'description'])
//         .filter()
//         .sort()
//         .paginate()
//         .fields();

//     const result = await playlistQuery.modelQuery;
//     const meta = await playlistQuery.countTotal();

//     return {
//         meta,
//         result,
//     };
// };

const getAllPlaylists = async (query: any, userId: string) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const matchStage: any = {};

    // search (name, description)
    if (query.searchTerm) {
        matchStage.$or = [
            { name: { $regex: query.searchTerm, $options: 'i' } },
            { description: { $regex: query.searchTerm, $options: 'i' } },
        ];
    }

    const sortStage: any = {};
    if (query.sortBy) {
        sortStage[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
        sortStage.createdAt = -1;
    }

    const aggregationPipeline = [
        { $match: matchStage },

        // populate user
        {
            $lookup: {
                from: 'normalusers',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

        // populate audios
        {
            $lookup: {
                from: 'audios', // collection name for Audio
                localField: 'audios',
                foreignField: '_id',
                as: 'audios',
            },
        },

        // add isMyPlaylist and project user fields
        {
            $addFields: {
                isMyPlaylist: {
                    $cond: {
                        if: {
                            $eq: [
                                '$user._id',
                                new mongoose.Types.ObjectId(userId),
                            ],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                tags: 1,
                cover_image: 1,
                audios: 1, // populated audios
                createdAt: 1,
                updatedAt: 1,
                isMyPlaylist: 1,
                user: {
                    _id: '$user._id',
                    name: '$user.name',
                    profile_image: '$user.profile_image',
                },
            },
        },

        // facet for pagination
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
                result: [
                    { $sort: sortStage },
                    { $skip: skip },
                    { $limit: limit },
                ],
            },
        },
        {
            $project: {
                result: 1,
                meta: { $arrayElemAt: ['$meta', 0] },
            },
        },
    ];

    const data = await Playlist.aggregate(aggregationPipeline);

    return {
        meta: data[0]?.meta || { page, limit, total: 0, totalPages: 0 },
        result: data[0]?.result || [],
    };
};
// Get All Playlists with QueryBuilder
const getMyPlaylists = async (
    userId: string,
    query: Record<string, unknown>
) => {
    const playlistQuery = new QueryBuilder(
        Playlist.find({ user: userId }).populate('audios'),
        query
    )
        .search(['name', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await playlistQuery.modelQuery;
    const meta = await playlistQuery.countTotal();

    return {
        meta,
        result,
    };
};

// Get Playlist by ID
const getPlaylistById = async (playlistId: string) => {
    const playlist = await Playlist.findById(playlistId)
        .populate({ path: 'user', select: 'name profile_image' })
        .populate('audios');
    if (!playlist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Playlist not found');
    }
    return playlist;
};

// Update Playlist
const updatePlaylist = async (
    userId: string,
    playlistId: string,
    payload: Partial<IPlaylist>
) => {
    const playlist = await Playlist.findOne({ user: userId, _id: playlistId });
    if (!playlist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Playlist not found');
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        payload,
        { new: true }
    );

    if (payload.cover_image && playlist.cover_image) {
        deleteFileFromS3(playlist.cover_image);
    }

    return updatedPlaylist;
};

// Delete Playlist
const deletePlaylist = async (userId: string, playlistId: string) => {
    const playlist = await Playlist.findOne({ user: userId, _id: playlistId });
    if (!playlist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Playlist not found');
    }
    const result = await Playlist.findByIdAndDelete(playlistId);
    if (playlist.cover_image) {
        deleteFileFromS3(playlist.cover_image);
    }
    return result;
};

const PlaylistService = {
    createPlaylist,
    getAllPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getMyPlaylists,
};

export default PlaylistService;
