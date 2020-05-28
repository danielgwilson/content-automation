import { getOutstandingFollows } from "./unfollow";
import { IFollowOutput } from "../../../types";

describe("Unfollow", () => {
  it("Gets previous follows from a given path", async () => {
    const follows = [
      {
        sessionStart: "2020-05-27T05:04:54.529Z",
        sessionEnd: "2020-05-27T05:07:35.177Z",
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
            timestamp: "2020-05-27T05:05:26.798Z",
            target: {
              username: "goldgiby",
              following: 348,
              followers: 305,
              likes: 4293,
            },
          },
        ],
        manager: {
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          timeout: 0,
        },
      },
    ];
    const unfollows = [
      {
        sessionStart: "2020-05-27T05:04:54.529Z",
        sessionEnd: "2020-05-27T05:07:35.177Z",
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
            timestamp: "2020-05-27T05:05:26.798Z",
            target: {
              username: "goldgiby",
              following: 348,
              followers: 305,
              likes: 4293,
            },
          },
          {
            timestamp: "2020-05-27T05:05:33.459Z",
            target: {
              username: "_meme_plug",
              following: 121,
              followers: 220,
              likes: 1494,
            },
          },
          {
            timestamp: "2020-05-27T05:05:44.068Z",
            target: {
              username: "ur.oppars.dont.know.u",
              following: 11,
              followers: 507,
              likes: 25800,
            },
          },
          {
            timestamp: "2020-05-27T05:05:58.047Z",
            target: {
              username: "s1nful",
              following: 421,
              followers: 152,
              likes: 2068,
            },
          },
          {
            timestamp: "2020-05-27T05:06:08.118Z",
            target: {
              username: "apackofgoldenoreos",
              following: 862,
              followers: 86,
              likes: 0,
            },
          },
          {
            timestamp: "2020-05-27T05:06:21.043Z",
            target: {
              username: "jefferson.steelflex1",
              following: 145,
              followers: 94,
              likes: 734,
            },
          },
          {
            timestamp: "2020-05-27T05:06:30.841Z",
            target: {
              username: "theonewiththeredhead",
              following: 2234,
              followers: 89,
              likes: 0,
            },
          },
          {
            timestamp: "2020-05-27T05:06:38.240Z",
            target: {
              username: "nageeba",
              following: 101,
              followers: 58,
              likes: 0,
            },
          },
          {
            timestamp: "2020-05-27T05:06:46.040Z",
            target: {
              username: "sphagettio",
              following: 26,
              followers: 30,
              likes: 0,
            },
          },
          {
            timestamp: "2020-05-27T05:07:00.370Z",
            target: {
              username: "bluebayj",
              following: 243,
              followers: 19,
              likes: 26,
            },
          },
          {
            timestamp: "2020-05-27T05:07:21.176Z",
            target: {
              username: "jose_garcia_username",
              following: 478,
              followers: 28,
              likes: 96,
            },
          },
          {
            timestamp: "2020-05-27T05:07:25.781Z",
            target: {
              username: "itzzeke13",
              following: 204,
              followers: 37,
              likes: 23,
            },
          },
        ],
        manager: {
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          timeout: 0,
        },
      },
    ];

    const outstandingFollows = await getOutstandingFollows({
      follows,
      unfollows,
    });
  });
});
