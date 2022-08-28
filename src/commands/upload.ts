import 'dotenv/config';
import path from 'path';
import Command, { flags } from '@oclif/command';
import { contextFlags } from '../flags/context-flags';
import { createContext, notify, saveObjectToJson } from '../util';
import {
  getFreshBlobFromPath,
  getFreshBlobsFromPath,
  getCaptionAndTags,
} from '../manager/helpers';
import { IUploadOutput } from '../types/upload';
import { getAuthClient, uploadVideo } from '../manager/youtube-api';

export class UploadCommand extends Command {
  static description = `
    uploads a generated video to a target platform
  `;

  static args = [];

  static flags = {
    ...contextFlags,
    resetSession: flags.boolean({
      char: 'r',
      description: 'start session without loading userDataDir or cookies', // help description for flag
      hidden: false, // hide from help
      default: false, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    title: flags.string({
      char: 't',
      description: "video title to enter into the 'Caption' field",
      hidden: false,
      required: false,
    }),
    testDetection: flags.boolean({
      char: 'T',
      description:
        "don't actually upload; instead, open bot detection testing page and save screenshot of results.",
      hidden: false,
      required: false,
      default: false,
    }),
    nContentRemaining: flags.boolean({
      char: 'n',
      description:
        "don't actually upload; instead, count number of remaining un-uploaded content items.",
      hidden: false,
      required: false,
      default: false,
    }),
    browserType: flags.string({
      char: 'b',
      description:
        "type of browser executable to use (either 'chromium', 'firefox', or 'webkit')",
      hidden: false,
      required: false,
      options: ['chromium', 'firefox', 'webkit'],
      default: 'firefox',
    }),
  };

  async run() {
    const { args, flags } = this.parse(UploadCommand);
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,

      resetSession,
      title,
      testDetection,
      browserType,
      nContentRemaining,
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    const contentDir = path.join(outputDir, 'content');

    function logRemainingContentItems(targetDir: string) {
      console.log(`\nRemaining non-uploaded content items in path:`);
      const contentItems = getFreshBlobsFromPath(targetDir);
      console.log(`Count: ${contentItems.length}`);
      console.log(contentItems.map((blob) => blob.id));
    }

    logRemainingContentItems(contentDir);

    if (nContentRemaining) return;

    /**
     * Uploads a video to the target platform.
     */

    notify(`Started uploading post(s) at ${new Date().toLocaleTimeString()}`);

    const { blob, blobDir } = getFreshBlobFromPath(contentDir);
    const videoPath = blob.outputPath;

    const tags = ['#shorts', '#reddit', '#askreddit'];
    const { caption } = getCaptionAndTags(title || blob.title, [], 100);

    const video = {
      path: videoPath,
      title: caption,
      description: caption + '\n\n' + tags.join(' '),
    };

    const authClient = await getAuthClient();
    const result = await uploadVideo(authClient, video.path, {
      title: video.title,
      description: video.description,
      tags: [],
    });
    console.dir(result, { depth: null });

    console.log('Successfully uploaded post!');

    const uploadedPost = {
      id: blob.id,
      dateUploaded: new Date(),
      context,
      targetDir: blobDir,
      outputName: blob.outputName,
      videoPath,
      caption,
      tags,
      manager: null,
    } as IUploadOutput;

    // console.log(`saveOutputToFile: ${context.saveOutputToFile}`);
    if (context.saveOutputToFile) {
      const fileName = `${uploadedPost.id}.upload.json`;
      console.log(`fileName: ${fileName}`);
      await saveObjectToJson(uploadedPost, {
        fileName,
        outputDir: blobDir,
      });
      console.log(`Saved output to file named ${fileName}`);
    }

    // } else {
    //   const credentials = getCredentials(outputDir);
    //   const page = await manager.login(credentials, {
    //     useCookies: !resetSession,
    //   });
    // await manager.uploadPost({
    //   targetDir: contentDir,
    //   title,
    //   page,
    // });
    // logRemainingContentItems(contentDir);
    // }

    // if (!context.debug) await manager.close(); // clean up only if not in debug mode

    notify(
      `Finished! Upload(s) completed at ${new Date().toLocaleTimeString()}`
    );
  }
}
