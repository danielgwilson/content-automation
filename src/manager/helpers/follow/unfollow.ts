import path from "path";
import { getFollowUnfollowBlobs, getOutstandingFollows } from "./follow-data";
import { getNumberFromShortString, saveObjectToJson } from "../../../util";
import { IUnfollowAction, IUnfollowOutput, IUser } from "../../../types";
import { waitForRandom } from "../wait";
import Manager from "../../manager";
import { MAX_UNFOLLOWS, getSelectorText } from "../../util";

const SELECTORS = {
  profile: {
    username: ".share-title-container > h2",
    followButton: ".follow-button",
    title: ".share-layout-main > div > .title",
    following: ".count-infos > .number:nth-child(1)",
    followers: ".count-infos > .number:nth-child(2)",
    likes: ".count-infos > .number:nth-child(3)",
  },
};

export async function unfollowUsers(
  manager: Manager,
  {
    numUnfollows,
    randomOrder = false,
  }: { numUnfollows?: number; randomOrder?: boolean } = {}
) {
  const sessionStart = new Date();

  if (numUnfollows !== undefined && numUnfollows > MAX_UNFOLLOWS)
    throw new Error(
      `numUnfollows of ${numUnfollows} exceeds the maximum number of unfollows per session (${MAX_UNFOLLOWS}) to avoid a shadow ban.`
    );

  const targetCount =
    numUnfollows !== undefined
      ? numUnfollows
      : MAX_UNFOLLOWS - 10 + Math.round(Math.random() * 10);
  console.log(`Attempting to unfollow ${targetCount} users.`);

  const blobs = await getFollowUnfollowBlobs(manager.context);
  const follows = getOutstandingFollows(blobs);

  const unfollowQueue = randomOrder
    ? getRandomSubarray(follows, targetCount)
    : follows.slice(0, targetCount);
  const unfollowActions: IUnfollowAction[] = [];
  try {
    for (let username of unfollowQueue) {
      const action = await unfollowUser(username, manager);
      if (action) unfollowActions.push(action);
    }
  } catch (e) {
    console.log(e);
  }

  const sessionEnd = new Date();

  const unfollowOutput = {
    sessionStart,
    sessionEnd,
    context: manager.context,
    account: manager.account,
    actionsTaken: unfollowActions,
    manager: {
      proxy: manager.proxy,
      executablePath: manager.executablePath,
      timeout: manager.timeout,
      browserType: manager.browserType,
    } as IManagerOutput,
  } as IUnfollowOutput;

  console.log(`Total users unfollowed successfully: ${unfollowActions.length}`);

  if (manager.context.saveOutputToFile) {
    const fileName = `${unfollowOutput.sessionStart.toISOString()}.unfollow.json`;
    await saveObjectToJson(unfollowOutput, {
      fileName,
      outputDir: path.join(manager.context.outputDir, "follows"),
    });
    console.log(`Saved output to file named ${fileName}`);
  }
}

async function unfollowUser(
  username: string,
  manager: Manager
): Promise<IUnfollowAction | null> {
  const page = await manager.browser.contexts()[0].newPage();
  const url = `https://www.tiktok.com/@${username}?lang=en`;

  await page.goto(url, { waitUntil: "load" });
  await waitForRandom(page);

  // See if title text element exists—3 cases.
  let titleText: string | null = null;
  try {
    titleText = await getSelectorText(page, SELECTORS.profile.title);
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
  const followButtonText = await getSelectorText(
    page,
    SELECTORS.profile.followButton
  );
  const followedBack = followButtonText === "Friends";

  const following = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.following)
  );
  const followers = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.followers)
  );
  const likes = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.likes)
  );

  // If not currently following, skip clicking the button but continue with rest (logs unfollow status so unfollow isn't unnecessarily attempted in the future)
  if (followButtonText !== "Follow") {
    await page.click(SELECTORS.profile.followButton); // actual unfollow action
  }
  await waitForRandom(page);

  // Check if follow successful.
  const followButtonText2 = await getSelectorText(
    page,
    SELECTORS.profile.followButton
  );
  if (followButtonText2 === "Follow")
    console.log(`Unfollowed user ${username}`);
  else throw new Error(`Failed to unfollow user @${username}`); // Unfollow unsuccessful for some reason.

  // Recheck titleText to determine if user is private
  let titleText2: string | null = null;
  try {
    titleText2 = await getSelectorText(page, SELECTORS.profile.title);
    if (titleText === "Couldn't find this account") {
      console.log(`${titleText}; skipping user "${username}"`);
      return null;
    }
  } catch (e) {
    // Profile found and user has videos
  }
  const isPrivate = titleText2 === "This account is private";

  await page.close();

  const action = {
    timestamp: new Date(),
    target: {
      username,
      isPrivate,
      following,
      followers,
      likes,
    } as IUser,
    followedBack,
  } as IUnfollowAction;

  return action;
}

/**
 * Gets a randomly selected subarray using Fisher-Yates shuffle
 * From https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
 * @param arr the array to sample from
 * @param size number of samples to include in the resulting subarray
 */
function getRandomSubarray(arr: any[], size: number) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}
