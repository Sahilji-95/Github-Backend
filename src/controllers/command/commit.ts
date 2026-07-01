import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function commitRepo(message: unknown) {
  const repoPath = path.resolve(process.cwd(), ".sahilGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitId = uuidv4();
    const commitDir = path.join(commitPath, commitId);
    await fs.mkdir(commitDir, { recursive: true });

    let files = await fs.readdir(stagedPath);
    for (let file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file),
      );
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString }),
    );

    console.log(`Commit ${commitId} created with message ${message}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to push:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
