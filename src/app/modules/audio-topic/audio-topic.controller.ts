/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import audioTopicService from './audio-topic.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

const createAudioTopic = catchAsync(async (req, res) => {
    const file: any = req.files?.topic_image;
    if (req.files?.topic_image) {
        req.body.topic_image = getCloudFrontUrl(file[0].key);
    }
    const result = await audioTopicService.createAudioTopicIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Audio topic created successfully',
        data: result,
    });
});

const updateAudioTopic = catchAsync(async (req, res) => {
    const { id } = req.params;
    const file: any = req.files?.topic_image;
    if (req.files?.topic_image) {
        req.body.topic_image = getCloudFrontUrl(file[0].key);
    }
    const result = await audioTopicService.updateAudioTopicIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio topic updated successfully',
        data: result,
    });
});

const getAllAudioTopics = catchAsync(async (req, res) => {
    const query = req.query;
    const { meta, result } = await audioTopicService.getAllTopics(query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio topics retrieved successfully',
        meta,
        data: result,
    });
});

const getSingleAudioTopic = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await audioTopicService.getSingleTopic(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audio topic retrieved successfully',
        data: result,
    });
});

const deleteAudioTopic = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await audioTopicService.deleteAudioTopicFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.NO_CONTENT,
        success: true,
        message: 'Audio topic deleted successfully',
        data: result,
    });
});

const audioTopicController = {
    createAudioTopic,
    updateAudioTopic,
    getAllAudioTopics,
    getSingleAudioTopic,
    deleteAudioTopic,
};

export default audioTopicController;
