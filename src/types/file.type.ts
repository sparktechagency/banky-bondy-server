/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IImageFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    bucket: string;
    key: string;
    acl: string;
    contentType: string;
    contentDisposition: string | null;
    contentEncoding: string | null;
    storageClass: string;
    serverSideEncryption: string | null;
    metadata: any;
    location: string;
    etag: string;
    versionId: string | undefined;
}
