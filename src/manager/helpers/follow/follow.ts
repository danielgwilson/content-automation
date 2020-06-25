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
import {
  getPreviouslyFollowedUsernames,
  getFollowUnfollowBlobs,
} from "./follow-data";

const SELECTORS = {
  videoFeedItem: ".video-feed-item > div > div > div > a > div > div",
  comment: {
    container: ".comment-container",
    noContent: ".comments.no-content",
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
  {
    tags = [],
    users = [],
    followCriteria = {
      isPrivate: null,
      maxFollowers: 10000,
      minFollowers: 10,
      maxFollowing: 10000,
      minFollowing: 10,
    },
    numFollows,
  }: {
    tags?: string[];
    users?: string[];
    followCriteria?: IFollowCriteria;
    numFollows?: number;
  } = {}
) {
  const sessionStart = new Date();

  if (
    (!tags && !users) ||
    (tags && tags.length === 0 && users && users.length === 0) ||
    (!users && tags && tags.length === 0) ||
    (!tags && users && users.length === 0)
  )
    throw new Error("Must include specific tag(s) or user(s) to follow users.");

  if (numFollows !== undefined && numFollows > MAX_FOLLOWS)
    throw new Error(
      `numFollows of ${numFollows} exceeds the maximum number of follows per session (${MAX_FOLLOWS}) to avoid a shadow ban.`
    );

  const targetCount =
    numFollows !== undefined
      ? numFollows
      : MAX_FOLLOWS - 10 + Math.round(Math.random() * 10);
  console.log(`Attempting to follow ${targetCount} users.`);

  if (tags.length > 0) {
    const tag = tags[0];
    await page.goto(`https://www.tiktok.com/tag/${tag}?lang=en`, {
      waitUntil: "load",
    });
  } else {
    const user = users[0];
    await page.goto(`https://www.tiktok.com/@${user}`);
  }

  // Wait for and click first video card on tag page
  await page.waitForSelector(SELECTORS.videoFeedItem);
  const videoFeedItems = await page.$$(SELECTORS.videoFeedItem);
  const followActions: IFollowAction[] = [];

  const usernamesAttempted: string[] = [];
  try {
    followLoop: for (let videoFeedItem of videoFeedItems) {
      await videoFeedItem.click();
      await waitForRandom(page);

      await page.waitForSelector(SELECTORS.comment.container);
      const hasComments = (await page.$(SELECTORS.comment.noContent)) === null;
      if (hasComments) {
        const commentItems = await page.$$(SELECTORS.comment.item);
        for (let commentItem of commentItems) {
          if (followActions.length >= targetCount) break followLoop;

          const userInfo = await commentItem.$(SELECTORS.comment.user.info);

          // Check if already following user
          if (
            userInfo &&
            !(await userInfo.$(SELECTORS.comment.user.following))
          ) {
            // Check if previously followed user in the past (data blob dump)
            const profileUrl = await page.evaluate(
              (element) => element.href,
              userInfo
            );
            const username = profileUrl.split("@")[1];
            const { follows } = await getFollowUnfollowBlobs(manager.context);
            const previouslyFollowedUsernames = await getPreviouslyFollowedUsernames(
              follows
            );
            const didPrevioulyFollow =
              usernamesAttempted.indexOf(username) !== -1 ||
              previouslyFollowedUsernames.indexOf(username) !== -1;

            if (!didPrevioulyFollow) {
              usernamesAttempted.push(username);
              const action = await followUser(
                username,
                manager,
                followCriteria
              );

              if (action) followActions.push(action);
            }

            await waitForRandom(page);
          }
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

  console.log(
    `Total users followed successfully (including requests): ${followActions.length}`
  );

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
  manager: Manager,
  followCriteria: IFollowCriteria
): Promise<IFollowAction | null> {
  const page = await manager.newPage();
  const url = `https://www.tiktok.com/@${username}?lang=en`;

  await page.goto(url, { waitUntil: "load" });
  await waitForRandom(page);

  // See if title text element exists—3 cases.
  let titleText: string | null = null;
  try {
    titleText = await page.$eval(
      SELECTORS.profile.title,
      (element) => element.textContent
    );
    if (titleText === "Couldn't find this account") {
      console.log(`${titleText}; skipping user "${username}"`);
      await page.close();
      return null;
    }
  } catch (e) {
    // Profile found and user has videos
  }

  // if (titleText === "No videos yet") true; // check if user has any videos

  await page.waitForSelector(SELECTORS.profile.followButton);
  const followButtonText = await page.$eval(
    SELECTORS.profile.followButton,
    (element) => element.textContent
  );

  // Exit if already following.
  if (followButtonText !== "Follow") {
    console.log(`Already following user "${username}"`);
    await page.close();
    return null;
  }

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
    console.log(`User "${username}" does not meet target criteria`);
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
    console.log(`Followed user "${username}"`);
  else if (followButtonText2 === "Requested")
    console.log(`Followed user "${username}"`);
  else if (followButtonText2 === "Friends")
    console.log(`Followed user "${username}" back (friends).`);
  // TODO: don't follow user if user is already following; minimal/unknown ROI of action.
  else throw new Error(`Failed to follow user @${username}`); // Follow unsuccessful for some reason.

  await page.close();

  const action = {
    timestamp: new Date(),
    target: user,
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
  else if (
    maxFollowers !== null &&
    user.followers !== undefined &&
    user.followers > maxFollowers
  )
    return false;
  else if (
    minFollowers !== null &&
    user.followers !== undefined &&
    user.followers < minFollowers
  )
    return false;
  else if (
    maxFollowing !== null &&
    user.following !== undefined &&
    user.following > maxFollowing
  )
    return false;
  else if (
    minFollowing !== null &&
    user.following !== undefined &&
    user.following < minFollowing
  )
    return false;
  else return true;
}
