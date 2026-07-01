import "dotenv/config";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { connectDB } from "./config/db.js";
import { initRepo } from "./controllers/command/init.js";
import { addRepo } from "./controllers/command/add.js";
import { commitRepo } from "./controllers/command/commit.js";
import { pullRepo } from "./controllers/command/pull.js";
import { pushRepo } from "./controllers/command/push.js";
import { revertRepo } from "./controllers/command/revert.js";
import mainRouter from "./routes/main.router.js";

yargs(hideBin(process.argv))
  .command("start", "Sarting the server", {}, startServer)
  .command("init", "Initialise a new Repository", {}, initRepo)
  .command(
    "add <file>",
    "new file added to your Repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    },
  )
  .command(
    "commit <message>",
    "commit the stage file",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commite message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    },
  )
  .command("pull", "Pull commit to S3", {}, pullRepo)
  .command("push", "Push commit to S3", {}, pushRepo)
  .command(
    "revert <commitID>",
    "revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commite ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    },
  )
  .demandCommand(1, "You need atleast one commmand ")
  .help().argv;

function startServer() {
  const app = express();
  const Port = process.env.PORT || 8080;
  const mongoURI = process.env.MONGODB_URI;

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  app.use("/", mainRouter);

  const httpServer = http.createServer(app);

  let user = "test";

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      user = userId;
      console.log("==========");
      console.log(user);
      console.log("==========");
      socket.join(userId);
    });
  });

  connectDB(mongoURI!);

  let db = mongoose.connection;
  db.once("open", async () => {
    console.log("CURD operation");
  });

  httpServer.listen(Port, () => {
    console.log(`Listing on port ${Port}`);
  });
}
