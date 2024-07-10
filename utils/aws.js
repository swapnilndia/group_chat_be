import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAW3MD7YRFKHYNSDE5",
    secretAccessKey: "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",
  },
});

export const getObjectURL = async (key) => {
  const command = new GetObjectCommand({
    Bucket: "swapnil-gc-private",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
};
export const putObject = async (filename, contentType, key) => {
  console.log(filename, contentType);
  const command = new PutObjectCommand({
    Bucket: "swapnil-gc-private",
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command);
  console.log(url);
  return url;
};

export const deleteObject = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: "swapnil-gc-private",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  console.log(url);
  return url;
};
