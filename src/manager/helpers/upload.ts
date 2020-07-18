import path from "path";
import { Page } from "playwright";

import Manager from "../manager";
import { waitForRandom } from "./wait";
import { getCaptionAndTags } from "./caption";
import { getSelectorText, MAX_VIDEO_LENGTH } from "../util";
import { saveObjectToJson } from "../../util/saveObjectToJson";
import { IGeneratorOutput } from "../../types";
import { IUploadOutput } from "../../types/upload";
import { getBlobs, BlobType } from "../../util";

export async function uploadPost(
  manager: Manager,
  {
    targetDir,
    title,
    page,
  }: {
    targetDir: string;
    title?: string;
    page: Page;
  }
) {
  const SELECTORS = {
    uploadVideo: ".upload-wrapper > a",
    fileInput: "input[type=file]",
    video: "video",
    uploadButton: "[class^=upload-btn--]",
    postButton: "[class^=btn-post--]:not([class*=disabled])",
    captionField: "[class^=editor--]",
    successDialog: "[class^=modal-title-container--] > div",
    successDialogTitle: "[class^=modal-title--]",
  };

  const { blob, blobDir } = getFreshBlobFromPath(targetDir);

  const videoPath = path.join(blobDir, blob.outputName);

  // if ((await getVideoLength(videoPath)) > MAX_VIDEO_LENGTH)
  //   throw new Error(
  //     `Video file at designated path exceeds maximum allowed duration of ${MAX_VIDEO_LENGTH} seconds.`
  //   );

  const idealTags = [
    "#reddit",
    "#askreddit",
    "#redditvids",
    "#redditstories",
    "#redditoutloud",
  ];
  const { caption, tags } = getCaptionAndTags(
    title || blob.title,
    idealTags,
    150
  );

  // Click "Upload video" icon
  await page.waitForSelector(SELECTORS.uploadVideo);
  await page.click(SELECTORS.uploadVideo);
  console.log("Clicked upload button");
  await waitForRandom(page);

  // Specify video file in file input
  await page.waitForLoadState("load");
  await page.waitForSelector(SELECTORS.uploadButton);
  const fileInputHandle = await page.$(SELECTORS.fileInput); // Must exist because of page.waitForSelector(...)
  if (!fileInputHandle) throw new Error("Failed to find file input element");
  await fileInputHandle.setInputFiles(videoPath);

  console.log(`File accepted (${videoPath})`);

  // Add caption
  await page.click(SELECTORS.captionField);
  await page.keyboard.type(caption, {
    delay: 50 * Math.random() + 20,
  });
  console.log(`Typed caption: ${caption}`);

  // Add hashtags
  await page.keyboard.type(" ", { delay: 50 * Math.random() + 50 }); // Type space after caption
  for (let [i, tag] of tags.entries()) {
    await page.keyboard.type(tag, { delay: 50 * Math.random() + 50 });
    await waitForRandom(page);
    await page.keyboard.press("Enter", {
      delay: 50 * Math.random() + 50,
    }); // Press enter between tags to ensure tag registers correctly
  }

  // After final tag or end of title, delete extra space to save on the character limit
  await page.keyboard.press("Backspace", {
    delay: 50 * Math.random() + 50,
  });

  // Click "Post"
  await page.waitForSelector(SELECTORS.postButton, { timeout: 60000 });
  if (!manager.context.debug) {
    await page.click(SELECTORS.postButton);
    console.log("Post button clicked");
  } else {
    console.log("Execution finished—paused at completion due to debug flag");
  }

  // Check for successful upload - important to ensure browser is not pre-emptively closed.
  await page.waitForSelector(SELECTORS.successDialogTitle);
  const successDialogTitleText = await getSelectorText(
    page,
    SELECTORS.successDialogTitle
  );
  if (successDialogTitleText !== "Your video is being uploaded to TikTok!")
    throw new Error(
      `Success dialog text is unexpected; dialog text is: ${successDialogTitleText}`
    );

  console.log("Successfully uploaded post!");

  const uploadedPost = {
    id: blob.id,
    dateUploaded: new Date(),
    context: manager.context,
    account: manager.account,
    targetDir: blobDir,
    outputName: blob.outputName,
    videoPath,
    caption,
    tags,
    manager: {
      proxy: manager.proxy,
      executablePath: undefined,
      timeout: manager.timeout,
    },
  } as IUploadOutput;

  console.log(`saveOutputToFile: ${manager.context.saveOutputToFile}`);
  if (manager.context.saveOutputToFile) {
    const fileName = `${uploadedPost.id}.upload.json`;
    console.log(`fileName: ${fileName}`);
    await saveObjectToJson(uploadedPost, {
      fileName,
      outputDir: blobDir,
    });
    console.log(`Saved output to file named ${fileName}`);
  }
}

export function getFreshBlobFromPath(targetPath: string) {
  const generatorBlobs = getBlobs(targetPath, {
    type: BlobType.generator,
  }) as IGeneratorOutput[];
  const uploadBlobs = getBlobs(targetPath, { type: BlobType.upload }); // Make sure we grab a content blob that hasn't previously been uploade
  const uploadIds =
    uploadBlobs.length > 0 ? uploadBlobs.map((blob) => blob.id) : [];
  let blob: IGeneratorOutput | undefined = undefined;
  for (let generatorBlob of generatorBlobs) {
    if (uploadIds.indexOf(generatorBlob.id) === -1) {
      blob = generatorBlob;
      break;
    }
  }
  if (!blob)
    throw new Error(
      `Failed to fetch IGeneratorOutput content blob from ${targetPath}; all possible blobs in this path were previously uploaded.`
    );

  const blobDir =
    generatorBlobs.length > 1 ? path.join(targetPath, blob.id) : targetPath;

  return { blob, blobDir };
}

export function getFreshBlobsFromPath(targetPath: string) {
  const generatorBlobs = getBlobs(targetPath, {
    type: BlobType.generator,
  }) as IGeneratorOutput[];
  const uploadBlobs = getBlobs(targetPath, { type: BlobType.upload }); // Make sure we grab a content blob that hasn't previously been uploaded
  const uploadIds =
    uploadBlobs.length > 0
      ? uploadBlobs.map((uploadBlob) => uploadBlob.id)
      : [];

  const freshBlobs = generatorBlobs.filter(
    (generatorBlob) => uploadIds.indexOf(generatorBlob.id) === -1
  );

  return freshBlobs;
}
