import fs from "fs/promises";
import path from "path";

export async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".sahilGit");
  const commitPath = path.join(repoPath, "commits");

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: "S3 bucket" }),
    );
    console.log("Repository initialised ");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to push:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
