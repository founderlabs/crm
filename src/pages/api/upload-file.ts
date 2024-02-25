import { env } from "~/env.mjs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { path, fileName, fileType } = req.body;
    const generatedPath = `${path}/${fileName}-${new Date().toISOString()}.${fileType}`;
    const accessKeyId = env.AWS_ADMIN_ROOT_ACCESS_KEY;
    const secretAccessKey = env.AWS_ADMIN_SECRET_KEY;
    const region = env.AWS_REGION;
    const client = new S3Client({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      region: region,
    });
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: generatedPath,
      ACL: "public-read",
    });
    const preSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });
    res.status(200).json({ preSignedUrl });
  } catch (e) {
    console.log(e);
  }
}
