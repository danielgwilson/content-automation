import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
import { crawlPost } from "../crawler/crawl-post";

export class CrawlCommand extends Command {
  static description = `
    crawls a reddit post with a given index and subreddit name
  `;

  static flags = {
    ...contextFlags,
    postId: flags.string({
      description: "id of the post to be crawled",
      hidden: false,
      multiple: false,
      required: false
    }),
    subredditName: flags.string({
      char: "n",
      description: "name of the subreddit to be crawled", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: "AskReddit", // default value if flag not passed (can be a function that returns a string or undefined)
      exclusive: ["postId"],
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    postIndex: flags.integer({
      char: "i",
      description: "index of the post to be crawled", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 0, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    nPosts: flags.integer({
      char: "p",
      description: "number of posts to crawl", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 1, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    minWords: flags.integer({
      char: "w",
      description: "minimum number of words to return", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 2.6 * 60 * 20, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxReplyDepth: flags.integer({
      char: "d",
      description:
        "maximum number of subcomments to return for each top-level comment", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 2, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxRepliesPerComment: flags.integer({
      char: "r",
      description:
        "maximum number of direct replies to return for each comment (not including sub-replies)", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 2, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    top: flags.string({
      char: "t",
      description: "sort subreddit posts by top (of time period)", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      required: false, // make flag required (this is not common and you should probably use an argument instead)
      options: ["hour", "day", "week", "month", "year", "all"]
    })
  };

  async run() {
    const { flags } = this.parse(CrawlCommand);
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
      postId,
      subredditName,
      postIndex,
      nPosts,
      minWords,
      maxReplyDepth,
      maxRepliesPerComment,
      top
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });

    const sort:
      | { type: "hot" }
      | {
          type: "top";
          time: "week" | "hour" | "day" | "month" | "year" | "all";
        } = top
      ? {
          type: "top",
          time: top as "week" | "hour" | "day" | "month" | "year" | "all"
        }
      : { type: "hot" };

    notify(`Started crawling post at ${new Date().toLocaleTimeString()}`);

    if (postId) {
      await crawlPost(context, {
        postId,
        minWords,
        maxReplyDepth,
        maxRepliesPerComment,
        sort
      });
    } else {
      const postIndeces = [...Array(postIndex + nPosts).keys()].slice(
        postIndex
      );
      await Promise.all(
        postIndeces.map(i =>
          crawlPost(context, {
            subredditName,
            postIndex: postIndex + i,
            minWords,
            maxReplyDepth,
            maxRepliesPerComment,
            sort
          })
        )
      );
    }

    notify(
      `Finished! Crawling completed at at ${new Date().toLocaleTimeString()}`
    );
  }
}
