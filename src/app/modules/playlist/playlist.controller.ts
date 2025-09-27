/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PlaylistService from './playlist.service';

// Create Playlist
const createPlaylist = catchAsync(async (req, res) => {
    const file: any = req.files?.playlist_cover;
    if (req.files?.playlist_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const result = await PlaylistService.createPlaylist(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Playlist created successfully',
        data: result,
    });
});

// Get All Playlists
const getAllPlaylists = catchAsync(async (req, res) => {
    const result = await PlaylistService.getAllPlaylists(
        req.query,
        req.user.profileId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Playlists retrieved successfully',
        data: result,
    });
});
const getMyPlaylists = catchAsync(async (req, res) => {
    const result = await PlaylistService.getMyPlaylists(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Playlists retrieved successfully',
        data: result,
    });
});

// Get Playlist by ID
const getPlaylistById = catchAsync(async (req, res) => {
    const { playlistId } = req.params;
    const result = await PlaylistService.getPlaylistById(playlistId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Playlist retrieved successfully',
        data: result,
    });
});

// Update Playlist
const updatePlaylist = catchAsync(async (req, res) => {
    const file: any = req.files?.playlist_cover;
    if (req.files?.playlist_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const { playlistId } = req.params;
    const result = await PlaylistService.updatePlaylist(
        req.user.profileId,
        playlistId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Playlist updated successfully',
        data: result,
    });
});

// Delete Playlist
const deletePlaylist = catchAsync(async (req, res) => {
    const { playlistId } = req.params;
    const result = await PlaylistService.deletePlaylist(
        req.user.profileId,
        playlistId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Playlist deleted successfully',
        data: result,
    });
});

const PlaylistController = {
    createPlaylist,
    getAllPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getMyPlaylists,
};

export default PlaylistController;
