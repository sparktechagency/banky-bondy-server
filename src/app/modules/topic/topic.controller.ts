/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import TopicServices from './topic.service';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';

// Create Topic
const createTopic = catchAsync(async (req, res) => {
    const file: any = req.files?.topic_image;
    if (req.files?.topic_image) {
        req.body.topic_image = getCloudFrontUrl(file[0].key);
    }
    const result = await TopicServices.createTopic(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Topic created successfully',
        data: result,
    });
});

// Get All Topics
const getAllTopics = catchAsync(async (req, res) => {
    const result = await TopicServices.getAllTopics(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Topics retrieved successfully',
        data: result,
    });
});

// Get Topic by ID
const getTopicById = catchAsync(async (req, res) => {
    const { topicId } = req.params;
    const result = await TopicServices.getTopicById(topicId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Topic retrieved successfully',
        data: result,
    });
});

// Update Topic
const updateTopic = catchAsync(async (req, res) => {
    const file: any = req.files?.topic_image;
    if (req.files?.topic_image) {
        req.body.topic_image = getCloudFrontUrl(file[0].key);
    }
    const { topicId } = req.params;
    const result = await TopicServices.updateTopic(topicId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Topic updated successfully',
        data: result,
    });
});

// Delete Topic
const deleteTopic = catchAsync(async (req, res) => {
    const { topicId } = req.params;
    const result = await TopicServices.deleteTopic(topicId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Topic deleted successfully',
        data: result,
    });
});

const TopicController = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
};

export default TopicController;
