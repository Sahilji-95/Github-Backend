import fs from "fs/promises";
import path from "path";

export async function addRepo(filePath: string | any) {
  const repoPath = path.resolve(process.cwd(), ".sahilGit");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagingPath, fileName));

    console.log(`File ${fileName} added to staging area`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to push:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
