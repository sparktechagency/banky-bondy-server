/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import AudioService from './audio.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

// Create Audio
const createAudio = catchAsync(async (req, res) => {
    const audiFile: any = req.files?.audio;
    if (req.files?.audio) {
        req.body.audio_url = getCloudFrontUrl(audiFile[0].key);
    }
    const file: any = req.files?.audio_cover;
    if (req.files?.audio_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }

    const result = await AudioService.createAudio(req.user.profileId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Audio created successfully',
        data: result,
    });
});

// Get All Audios
const getAllAudios = catchAsync(async (req, res) => {
    const result = await AudioService.getAllAudios(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audios retrieved successfully',
        data: result,
    });
});
// Get All Audios
const getMyAudios = catchAsync(async (req, res) => {
    const result = await AudioService.getMyAudios(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audios retrieved successfully',
        data: result,
    });
});

// Get Audio by ID
const getAudioById = catchAsync(async (req, res) => {
    const { audioId } = req.params;
    const result = await AudioService.getAudioById(audioId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio retrieved successfully',
        data: result,
    });
});

// Update Audio
const updateAudio = catchAsync(async (req, res) => {
    const audiFile: any = req.files?.audio;
    if (req.files?.audio) {
        req.body.audio_url = getCloudFrontUrl(audiFile[0].key);
    }
    const file: any = req.files?.audio_cover;
    if (req.files?.audio_cover) {
        req.body.cover_image = getCloudFrontUrl(file[0].key);
    }
    const { audioId } = req.params;
    const result = await AudioService.updateAudio(
        req.user.profileId,
        audioId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio updated successfully',
        data: result,
    });
});

// Delete Audio
const deleteAudio = catchAsync(async (req, res) => {
    const { audioId } = req.params;
    const result = await AudioService.deleteAudio(req.user.profileId, audioId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio deleted successfully',
        data: result,
    });
});
// give rating
const giveRating = catchAsync(async (req, res) => {
    const { audioId } = req.params;
    const result = await AudioService.giveRating(
        req.user.profileId,
        audioId,
        req.body.rating
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio rating added successfully',
        data: result,
    });
});

const AudioController = {
    createAudio,
    getAllAudios,
    getAudioById,
    updateAudio,
    deleteAudio,
    getMyAudios,
    giveRating,
};

export default AudioController;
