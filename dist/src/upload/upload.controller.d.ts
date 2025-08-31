import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File, path: string): Promise<{
        Expiration?: string | undefined;
        ETag?: string | undefined;
        ChecksumCRC32?: string | undefined;
        ChecksumCRC32C?: string | undefined;
        ChecksumCRC64NVME?: string | undefined;
        ChecksumSHA1?: string | undefined;
        ChecksumSHA256?: string | undefined;
        ChecksumType?: import("@aws-sdk/client-s3").ChecksumType | undefined;
        ServerSideEncryption?: import("@aws-sdk/client-s3").ServerSideEncryption | undefined;
        VersionId?: string | undefined;
        SSECustomerAlgorithm?: string | undefined;
        SSECustomerKeyMD5?: string | undefined;
        SSEKMSKeyId?: string | undefined;
        SSEKMSEncryptionContext?: string | undefined;
        BucketKeyEnabled?: boolean | undefined;
        Size?: number | undefined;
        RequestCharged?: import("@aws-sdk/client-s3").RequestCharged | undefined;
        $metadata: import("@smithy/types").ResponseMetadata;
        url: string;
    }>;
}
