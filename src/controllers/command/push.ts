import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET } from "../../config/aws-config.js";

export async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".sahilGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    try {
      await fs.access(commitsPath);
    } catch {
      console.error("No commits found. Please commit first.");
      return;
    }

    const commitDirs = await fs.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);

      const files = (await fs.readdir(commitPath)).filter(
        (file) => !file.startsWith("."),
      );

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`,
          Body: fileContent,
        };

        await s3.upload(params).promise();
      }
    }

    console.log("All files pushed on S3.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to push:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
