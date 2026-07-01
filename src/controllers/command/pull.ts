import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET } from "../../config/aws-config.js";

export async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".sahilGit");
  const commitPath = path.join(repoPath, "commits");

  try {
    const data = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: "commits/",
      })
      .promise();

    const objects = data.Contents;

    if (!objects || objects.length === 0) {
      console.log("No objects found");
      return;
    }

    for (const object of objects) {
      if (!object.Key) continue;

      const key = object.Key;
      const parts = key.split("/");
      const keyName = parts.length > 1 ? parts[1] : "root";

      const commitDir = path.join(commitPath, keyName as string);

      await fs.mkdir(commitDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.getObject(params).promise();
      await fs.writeFile(path.join(repoPath, key), fileContent.Body as Buffer);
    }
    console.log("All Commit pulled from S3");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Unable to Pull:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
