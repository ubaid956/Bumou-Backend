"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.stClient = new client_s3_1.S3Client({
            region: this.configService.getOrThrow('AWS_S3_REGION'),
        });
    }
    async uploadFile(file, path) {
        const currentDateTime = new Date().toISOString().replace(/:/g, '-');
        const fileName = `${currentDateTime}-${file.originalname}`;
        if (path) {
            path = path.replace(/^\/|\/$/g, '');
        }
        path = `app/${path}`;
        let key = path ? `${path}/${fileName}` : fileName;
        key = key.replace(/[^\w.-_]/g, '-');
        console.log('Upload key: ', key);
        const uploadParams = {
            Bucket: 'bumoubucket',
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        console.log('Upload key 2: ');
        const uploadResult = await this.stClient.send(new client_s3_1.PutObjectCommand(uploadParams));
        console.log('Upload key 3: ');
        const aclParams = {
            Bucket: 'bumoubucket',
            Key: key,
            ACL: 'public-read',
        };
        console.log('Upload key 4: ');
        const aclResult = await this.stClient.send(new client_s3_1.PutObjectAclCommand(aclParams));
        console.log('Upload key 5: ');
        return {
            url: `https://bumoubucket.s3.cn-northwest-1.amazonaws.com.cn/${key}`,
            ...uploadResult,
        };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map