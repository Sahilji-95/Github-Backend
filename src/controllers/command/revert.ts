import fs from "fs";
import path from "path";
import { promisify } from "util";

const readDir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

export async function revertRepo(commitID: string | any) {
  const repoPath = path.resolve(process.cwd(), ".sahilGit");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitDir = path.join(commitPath, commitID);
    const files = await readDir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      await copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }

    console.log(`Commit with id ${commitID} reverted successfully`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Unable to Revert:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
