/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';

const uploadConversationFiles = catchAsync(async (req, res) => {
    let images: string[] = [];
    let videos: string[] = [];
    let pdfs: string[] = [];
    if (req.files?.conversation_image) {
        images = req.files.conversation_image.map((file: any) => {
            return getCloudFrontUrl(file.key);
        });
    }

    if (req.files?.conversation_video) {
        videos = req.files.conversation_video.map((file: any) => {
            return getCloudFrontUrl(file.key);
        });
    }
    if (req.files?.conversation_pdf) {
        pdfs = req.files.conversation_pdf.map((file: any) => {
            return getCloudFrontUrl(file.key);
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Files uploaded successfully',
        data: {
            images,
            videos,
            pdfs,
        },
    });
});

const deleteFiles = catchAsync(async (req, res) => {
    const files = await req.body.files;
    console.log('Start delete files');
    await Promise.all(files.map((file: any) => deleteFileFromS3(file)));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Files deleted successfully',
        data: null,
    });
});

const fileController = {
    uploadConversationFiles,
    deleteFiles,
};
export default fileController;
