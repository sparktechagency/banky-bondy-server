/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    S3Client,
    HeadObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const deleteFileFromS3 = async (fileName: string) => {
    const updatedFileName = fileName.split('cloudfront.net/')[1];
    const decodedFileName = decodeURIComponent(updatedFileName);
    const bucket = process.env.AWS_S3_BUCKET_NAME!;

    try {
        // 1. Check if the file exists in S3
        const headCommand = new HeadObjectCommand({
            Bucket: bucket,
            Key: decodedFileName,
        });

        try {
            await s3.send(headCommand);
        } catch (err: any) {
            if (err.name === 'NotFound') {
                console.log(`File ${decodedFileName} does not exist in S3.`);
                return;
            }
            throw err;
        }

        // 2. Delete the file
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucket,
            Key: decodedFileName,
        });

        await s3.send(deleteCommand);
        console.log(`Successfully deleted ${decodedFileName} from S3`);
    } catch (err: any) {
        if (err.name === 'NotFound') {
            console.error(`File ${decodedFileName} was not found in S3.`);
        } else {
            console.error('Error deleting file from S3:', err);
        }
    }
};
