#!/usr/bin/env node

import path from "path";
import program from "commander";
import { createContext } from "./createContext";
import { demo } from "./demo";
import { crawlPost } from "./crawlPost";

program.version(require("../../package.json").version);

// error on unknown commands
program.on("command:*", function() {
  console.error(
    `Invalid command: ${program.args.join(
      " "
    )}\nSee --help for a list of available commands.`
  );
  process.exit(1);
});

program
  .command("demo")
  .description(
    "Scrape the top AskReddit post from the past week and generate a video (with metadata)"
  )
  .option("-O, --outputDir <path>")
  .option("-R, --resourceDir <path>")
  .option("-F, --saveOutputToFile")
  .option("-D, --debug")
  .action(({ outputDir, resourceDir, saveOutputToFile, debug }) => {
    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });
    demo(context);
  });

program
  .command("crawl")
  .option("-O, --outputDir <path>")
  .option("-R, --resourceDir <path>")
  .option("-F, --saveOutputToFile")
  .option("-D, --debug")
  .option(
    "-n, --subredditName <name>",
    "name of the subreddit to be crawled",
    "AskReddit"
  )
  .option("-p, --postIndex <index>", "index of the post to be crawled", 0)
  .option(
    "-w, --minWords <words>",
    "minimum number of words to retrieve",
    2.6 * 60 * 20
  )
  .option("-d, --maxReplyDepth <depth>", "maximum depth of comment replies", 2)
  .option(
    "-r, --maxRepliesPerComment <replies>",
    "maximum number of replies per comment",
    2
  )
  .option(
    "-s, --sortType (hot|top) <type>",
    "type of sort applied to subreddit posts",
    "hot"
  )
  .option(
    "-t, --sortTime (week|hour|day|month|year|all) <time>",
    'time range for sort (only applies to "top"',
    "week"
  )
  .description("Scrape a Reddit post")
  .action(
    ({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,

      subredditName,
      postIndex,
      minWords,
      maxReplyDepth,
      maxRepliesPerComment,
      sortType,
      sortTime
    }) => {
      if (["hot", "top"].indexOf(sortType) === -1) {
        console.error(
          'Invalid sort type - please try again with either "hot" or "top."'
        );
        process.exit(1);
      }
      const sort =
        sortType === "hot"
          ? { type: sortType }
          : { type: sortType, time: sortTime };

      const context = createContext({
        outputDir,
        resourceDir,
        saveOutputToFile,
        debug
      });
      crawlPost(context, {
        subredditName,
        postIndex,
        minWords,
        maxReplyDepth,
        maxRepliesPerComment,
        sort
      });
    }
  );

program.parse(process.argv);

// if (!program.args.length) program.help();
