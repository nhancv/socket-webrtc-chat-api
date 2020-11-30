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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Service = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
let AwsS3Service = class AwsS3Service {
    constructor() {
        this.region = process.env.AWS_REGION || '';
        aws_sdk_1.default.config.update({ region: this.region });
        aws_sdk_1.default.config.getCredentials(function (err) {
            if (err)
                console.log(err.stack);
            else {
            }
        });
        this.s3 = new s3_1.default();
    }
    listBuckets() {
        return new Promise((resolve, reject) => {
            this.s3.listBuckets(function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Buckets);
                }
            });
        });
    }
    createBucket(bucketName) {
        const bucketParams = {
            Bucket: bucketName,
            ACL: 'public-read'
        };
        return new Promise((resolve, reject) => {
            this.s3.createBucket(bucketParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Location);
                }
            });
        });
    }
    uploadFile(bucketName, filePath, key) {
        const fileStream = fs_1.default.createReadStream(filePath);
        fileStream.on('error', function (err) {
            console.log('File Error', err);
        });
        const uploadParams = { Bucket: bucketName, Key: key || path_1.default.basename(filePath), Body: fileStream };
        return new Promise((resolve, reject) => {
            this.s3.upload(uploadParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                if (data) {
                    resolve(data.Location);
                }
            });
        });
    }
    listObjects(bucketName) {
        const bucketParams = {
            Bucket: bucketName
        };
        return new Promise((resolve, reject) => {
            this.s3.listObjects(bucketParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    deleteBucket(bucketName) {
        const bucketParams = {
            Bucket: bucketName
        };
        return new Promise((resolve, reject) => {
            this.s3.deleteBucket(bucketParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    deleteObject(bucketName, key) {
        const bucketParams = {
            Bucket: bucketName,
            Key: key
        };
        return new Promise((resolve, reject) => {
            this.s3.deleteObject(bucketParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getBucketPolicy(bucketName) {
        const bucketParams = {
            Bucket: bucketName
        };
        return new Promise((resolve, reject) => {
            this.s3.getBucketPolicy(bucketParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Policy);
                }
            });
        });
    }
    putBucketPolicy(bucketName) {
        const readOnlyAnonUserPolicy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: `${Date.now()}`,
                    Effect: "Allow",
                    Principal: "*",
                    Action: [
                        "s3:GetObject"
                    ],
                    Resource: [
                        `arn:aws:s3:::${bucketName}/*`
                    ]
                }
            ]
        };
        const bucketPolicyParams = { Bucket: bucketName, Policy: JSON.stringify(readOnlyAnonUserPolicy) };
        return new Promise((resolve, reject) => {
            this.s3.putBucketPolicy(bucketPolicyParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    deleteBucketPolicy(bucketName) {
        const bucketParams = { Bucket: bucketName };
        return new Promise((resolve, reject) => {
            this.s3.deleteBucketPolicy(bucketParams, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
};
AwsS3Service = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], AwsS3Service);
exports.AwsS3Service = AwsS3Service;
//# sourceMappingURL=aws-s3.service.js.map