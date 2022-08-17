import {
  getOutstandingFollows,
  getPreviouslyFollowedUsernames,
} from "./follow-data";
import { IFollowOutput, IUnfollowOutput } from "../../../types";

describe("Unfollow", () => {
  it("Gets previous follows from a given path", async () => {
    const follows = [
      {
        sessionStart: new Date("2020-05-27T05:04:54.529Z"),
        sessionEnd: new Date("2020-05-27T05:07:35.177Z"),
        context: {
          outputDir:
            "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp",
          resourceDir:
            "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources",
          saveOutputToFile: true,
          debug: true,
        },
        account: "iuploadfromreddit@gmail.com",
        tags: ["askreddit"],
        actionsTaken: [
          {
            timestamp: new Date("2020-05-27T05:05:26.798Z"),
            target: {
              username: "goldgiby",
              isPrivate: false,
              following: 348,
              followers: 305,
              likes: 4293,
            },
          },
          {
            timestamp: new Date("2020-05-27T05:05:33.459Z"),
            target: {
              username: "_meme_plug",
              isPrivate: false,
              following: 121,
              followers: 220,
              likes: 1494,
            },
          },
        ],
        manager: {
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          timeout: 0,
        },
      } as IFollowOutput,
    ];
    const unfollows = [
      {
        sessionStart: new Date("2020-05-27T05:04:54.529Z"),
        sessionEnd: new Date("2020-05-28T05:07:35.177Z"),
        context: {
          outputDir:
            "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp",
          resourceDir:
            "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources",
          saveOutputToFile: true,
          debug: true,
        },
        account: "iuploadfromreddit@gmail.com",
        tags: ["askreddit"],
        actionsTaken: [
          {
            timestamp: new Date("2020-05-28T00:00:00.000Z"),
            target: {
              username: "goldgiby",
              isPrivate: false,
              following: 348,
              followers: 305,
              likes: 4293,
            },
            followedBack: false,
          },
        ],
        manager: {
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          timeout: 0,
        },
      } as IUnfollowOutput,
    ];

    const outstandingFollows = await getOutstandingFollows({
      follows,
      unfollows,
    });

    expect(outstandingFollows).toContain("_meme_plug");
    expect(outstandingFollows).not.toContain("goldgiby");
  });

  it("Gets the set of previously followed usernames", async () => {
    const follows = [
      {
        sessionStart: new Date("2020-05-27T05:04:54.529Z"),
        sessionEnd: new Date("2020-05-27T05:07:35.177Z"),
        context: {
          outputDir:
            "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp",
          resourceDir:
            "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources",
          saveOutputToFile: true,
          debug: true,
        },
        account: "iuploadfromreddit@gmail.com",
        tags: ["askreddit"],
        actionsTaken: [
          {
            timestamp: new Date("2020-05-27T05:05:26.798Z"),
            target: {
              username: "goldgiby",
              isPrivate: false,
              following: 348,
              followers: 305,
              likes: 4293,
            },
          },
          {
            timestamp: new Date("2020-05-27T05:05:33.459Z"),
            target: {
              username: "_meme_plug",
              isPrivate: false,
              following: 121,
              followers: 220,
              likes: 1494,
            },
          },
          {
            timestamp: new Date("2020-05-30T05:05:33.459Z"),
            target: {
              username: "_meme_plug",
              isPrivate: false,
              following: 121,
              followers: 220,
              likes: 1494,
            },
          },
        ],
        manager: {
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          timeout: 0,
        },
      } as IFollowOutput,
    ];

    const usernames = await getPreviouslyFollowedUsernames(follows);
    expect(usernames).toStrictEqual(["goldgiby", "_meme_plug"]);
  });
});
