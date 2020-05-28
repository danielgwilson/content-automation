import path from "path";
import { Page, ElementHandle, Browser } from "puppeteer";

import Manager from "../../manager";
import { waitForRandom } from "../wait";
import {
  IFollowOutput,
  IFollowAction,
  IUser,
  IFollowCriteria,
} from "../../../types/follow";
import { getSelectorText, MAX_FOLLOWS } from "../../util";
import { saveObjectToJson, getNumberFromShortString } from "../../../util";

const SELECTORS = {
  videoFeedItem: ".video-feed-item > div > div > div > a > div > div",
  comment: {
    item: ".comment-item",
    user: {
      info: ".comment-content > .content-container > .user-info",
      username: ".username",
      following: ".identity",
    },
  },
  closeButton: ".close",
  profile: {
    username: ".share-title-container > h2",
    followButton: ".follow-button",
    title: ".share-layout-main > div > .title",
    following: ".count-infos > .number:nth-child(1)",
    followers: ".count-infos > .number:nth-child(3)",
    likes: ".count-infos > .number:nth-child(5)",
  },
};

export async function followUsers(
  manager: Manager,
  page: Page,
  tags: string[],
  {
    followCriteria = {
      isPrivate: null,
      maxFollowers: 10000,
      minFollowers: 10,
      maxFollowing: 10000,
      minFollowing: 10,
    },
    numFollows,
  }: { followCriteria?: IFollowCriteria; numFollows?: number } = {}
) {
  const sessionStart = new Date();

  if (tags.length === 0)
    throw new Error("Must include specific tags to follow users.");

  if (numFollows !== undefined && numFollows > MAX_FOLLOWS)
    throw new Error(
      `numFollows of ${numFollows} exceeds the maximum number of follows per session (${MAX_FOLLOWS}) to avoid a shadow ban.`
    );

  const targetCount =
    numFollows !== undefined
      ? numFollows
      : MAX_FOLLOWS - 10 + Math.round(Math.random() * 10);
  console.log(`Attempting to follow ${targetCount} users.`);

  const tag = tags[0];
  await page.goto(`https://www.tiktok.com/tag/${tag}?lang=en`, {
    waitUntil: "load",
  });

  // Wait for and click first video card on tag page
  await page.waitForSelector(SELECTORS.videoFeedItem);
  const videoFeedItems = await page.$$(SELECTORS.videoFeedItem);
  const followActions: IFollowAction[] = [];

  const usernamesAttempted: string[] = [];
  try {
    followLoop: for (let videoFeedItem of videoFeedItems) {
      await videoFeedItem.click();
      await waitForRandom(page);

      await page.waitForSelector(SELECTORS.comment.item);
      const commentItems = await page.$$(SELECTORS.comment.item);
      for (let commentItem of commentItems) {
        if (followActions.length >= targetCount) break followLoop;

        const userInfo = await commentItem.$(SELECTORS.comment.user.info);

        // Check if already following user
        if (userInfo && !(await userInfo.$(SELECTORS.comment.user.following))) {
          const username = await getSelectorText(
            userInfo,
            SELECTORS.comment.user.username
          );

          if (usernamesAttempted.indexOf(username) === -1) {
            usernamesAttempted.push(username);
            const action = await followUser(
              username,
              manager.browser,
              followCriteria
            );

            if (action) followActions.push(action);
          }

          await waitForRandom(page);
        }
      }

      await page.click(SELECTORS.closeButton);
      await waitForRandom(page);
    }
  } catch (e) {
    console.log(e);
  }

  const sessionEnd = new Date();

  const followOutput = {
    sessionStart,
    sessionEnd,
    context: manager.context,
    account: manager.account,
    tags,
    actionsTaken: followActions,
    manager: {
      proxy: manager.proxy,
      executablePath: manager.executablePath,
      timeout: manager.timeout,
    },
  } as IFollowOutput;

  console.log(followOutput);
  if (manager.context.saveOutputToFile) {
    const fileName = `${followOutput.sessionStart.toISOString()}.follow.json`;
    await saveObjectToJson(followOutput, {
      fileName,
      outputDir: path.join(manager.context.outputDir, "follows"),
    });
    console.log(`Saved output to file named ${fileName}`);
  }
}

async function followUser(
  username: string,
  browser: Browser,
  followCriteria: IFollowCriteria
): Promise<IFollowAction | null> {
  const page = await browser.newPage();
  const url = `https://www.tiktok.com/@${username}?lang=en`;

  await page.goto(url, { waitUntil: "load" });
  await waitForRandom(page);

  // See if title text element exists—3 cases.
  let titleText: string | null = null;
  try {
    titleText = await getSelectorText(page, SELECTORS.profile.title);
    if (titleText === "Couldn't find this account") {
      console.log(`${titleText}; skipping user.`);
      return null;
    }
  } catch (e) {
    // Profile found and user has videos
  }

  // if (titleText === "No videos yet") true; // check if user has any videos

  await page.waitForSelector(SELECTORS.profile.followButton);
  const followButtonText = await getSelectorText(
    page,
    SELECTORS.profile.followButton
  );
  if (followButtonText !== "Follow") {
    await page.close();
    return null;
  } // Exit if already following.

  const isPrivate = titleText === "This account is private";
  const following = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.following)
  );
  const followers = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.followers)
  );
  const likes = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.likes)
  );

  const user = {
    username,
    isPrivate,
    following,
    followers,
    likes,
  } as IUser;

  // Check if user fits target criteria; only want to follow users likely to follow back.
  if (!shouldFollowUser(user, followCriteria)) {
    await page.close();
    return null;
  }

  await page.click(SELECTORS.profile.followButton);
  await waitForRandom(page);

  // Check if follow successful.
  const followButtonText2 = await getSelectorText(
    page,
    SELECTORS.profile.followButton
  );

  if (followButtonText2 === "Following")
    console.log(`Followed user ${username}`);
  else if (followButtonText2 === "Requested")
    console.log(`Followed user ${username}`);
  else throw new Error(`Failed to follow user @${username}`); // Follow unsuccessful for some reason.

  await page.close();

  const action = {
    timestamp: new Date(),
    target: {
      username,
      following,
      followers,
      likes,
    } as IUser,
  } as IFollowAction;

  return action;
}

function shouldFollowUser(
  user: IUser,
  followCriteria: IFollowCriteria
): boolean {
  const {
    isPrivate,
    maxFollowers,
    minFollowers,
    maxFollowing,
    minFollowing,
  } = followCriteria;

  if (isPrivate !== null && user.isPrivate !== isPrivate) return false;
  else if (maxFollowers !== null && user.followers > maxFollowers) return false;
  else if (minFollowers !== null && user.followers < minFollowers) return false;
  else if (maxFollowing !== null && user.following > maxFollowing) return false;
  else if (minFollowing !== null && user.following < minFollowing) return false;
  else return true;
}
