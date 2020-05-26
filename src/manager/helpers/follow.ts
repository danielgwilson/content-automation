import path from "path";
import { Page } from "puppeteer";

import Manager from "../manager";
import { waitForRandom } from "./wait";
import { IFollowOutput, IFollowAction, IAccount } from "../../types/follow";
import { saveObjectToJson, getNumberFromShortString } from "../../util";
export async function followUsers(
  manager: Manager,
  page: Page,
  tags: string[]
) {
  const sessionStart = new Date();
  const SELECTORS = {
    videoCard: ".video-card-mask",
    commentUsername: ".username",
    followButton: ".follow-button",

    profile: {
      username: ".share-title-container > h2",
      following: ".count-infos > strong:nth-child(1)",
      followers: ".count-infos > strong:nth-child(3)",
      likes: ".count-infos > strong:nth-child(5)",
    },
  };
  const targetCount = 15 + Math.random() * 10;

  if (tags.length <= 0)
    throw new Error("Must include specific tags to follow users.");

  const tag = tags[0];
  await page.goto(`https://www.tiktok.com/tag/${tag}?lang=en`, {
    waitUntil: "load",
  });

  // Wait for and click first video card on tag page
  await page.waitForSelector(SELECTORS.videoCard);
  await page.click(SELECTORS.videoCard);
  await waitForRandom(page);

  // Wait for comments to load and click username of first comment
  await page.waitForSelector(SELECTORS.commentUsername);
  await page.click(SELECTORS.commentUsername);
  await waitForRandom(page);

  // Wait for comments to load and click username of first comment
  await page.waitForSelector(SELECTORS.followButton);
  const followButtonText = await getSelectorText(page, SELECTORS.followButton);
  if (followButtonText !== "Follow") return; // Exit if already following.
  await page.click(SELECTORS.followButton);
  await waitForRandom(page);

  // Get target user details
  await page.waitForSelector(SELECTORS.profile.username);
  const username = await getSelectorText(page, SELECTORS.profile.username);
  const following = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.following)
  );
  const followers = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.followers)
  );
  const likes = getNumberFromShortString(
    await getSelectorText(page, SELECTORS.profile.likes)
  );

  const action = {
    timestamp: new Date(),
    target: {
      username,
      following,
      followers,
      likes,
    } as IAccount,
  } as IFollowAction;

  const sessionEnd = new Date();

  const followOutput = {
    sessionStart,
    sessionEnd,
    context: manager.context,
    account: manager.account,
    tags,
    actionsTaken: [action],
    manager: {
      proxy: manager.proxy,
      executablePath: manager.executablePath,
      timeout: manager.timeout,
    },
  } as IFollowOutput;

  console.log(followOutput);
  if (manager.context.saveOutputToFile) {
    const fileName = `${followOutput.sessionStart}.follow.json`;
    await saveObjectToJson(followOutput, {
      fileName,
      outputDir: path.join(manager.context.outputDir, "follows"),
    });
    console.log(`Saved output to file named ${fileName}`);
  }
}

async function getSelectorText(page: Page, selector: string) {
  const element = await page.$(selector);
  const text = await page.evaluate((element) => element.textContent, element);
  return text;
}
