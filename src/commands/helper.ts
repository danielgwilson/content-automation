import path from 'path';
import config from 'config';
import Command, { flags } from '@oclif/command';
import { contextFlags } from '../flags/context-flags';
import { createContext, notify, logPost } from '../util';
import Crawler from '../crawler';
import Processor from '../processor';
import Generator from '../generator';

/**
 * Glue code helper command - okay that this isn't DRY
 */
export class HelperCommand extends Command {
  static description = `
    easily handles a target url end-to-end; crawls, processes, and generates a video.
  `;

  static args = [
    {
      name: 'postUri', // name of arg to show in help and reference with args[name]
      required: true, // make the arg required with `required: true`
      description: 'url of the target reddit post', // help description
      hidden: false, // hide this arg from help
    },
  ];

  static flags = {
    ...contextFlags,
    maxRepliesPerComment: flags.integer({
      char: 'r',
      description: 'maximum number of replies to each comment (breadth)', // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 1, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxReplyDepth: flags.integer({
      char: 'd',
      description: 'maximum number of replies deep per chain (depth)', // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 2, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxComments: flags.integer({
      char: 'c',
      description: 'maximum number of top-level comments', // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 10, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxAudioLength: flags.integer({
      char: 'l',
      description: 'maximum length of audio to use in final video (in seconds)', // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 50, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    speakingRate: flags.integer({
      char: 's',
      description: 'speaking rate for generated TTS audio (in %)', // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 115, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
  };

  async run() {
    const { args, flags } = this.parse(HelperCommand);
    const { postUri } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
      maxRepliesPerComment,
      maxReplyDepth,
      maxComments,
      maxAudioLength,
      speakingRate,
    } = flags;

    const context = createContext({
      outputDir: path.join(outputDir, 'content'),
      resourceDir,
      saveOutputToFile,
      debug,
    });

    /**
     * Crawl target postUri
     */
    notify(`Started crawling post at ${new Date().toLocaleTimeString()}`);

    const crawler = new Crawler(context);

    const uriSuffix = postUri.split('sort').length > 1 ? '' : '&sort=top'; // Don't add sort query parameter if already present

    const post = await crawler.getPost({
      postUri: `${postUri}${uriSuffix}`,
    });
    logPost(post);

    notify(
      `Finished! Crawling completed at at ${new Date().toLocaleTimeString()}`
    );

    /**
     * Process post and download audio
     */
    notify(`Started processing post at ${new Date().toLocaleTimeString()}`);

    const processor = new Processor(context, {
      GOOGLE_APPLICATION_CREDENTIALS: config.get(
        'GOOGLE_APPLICATION_CREDENTIALS'
      ),
    });
    const processedPost = await processor.process(post, {
      maxRepliesPerComment,
      maxReplyDepth,
      maxComments,
      maxAudioLength,
      speakingRate: speakingRate / 100,
    });

    notify(
      `Finished! Processing completed at ${new Date().toLocaleTimeString()}`
    );

    /**
     * Generate final video
     */
    notify(`Started generating media at ${new Date().toLocaleTimeString()}`);

    // Create new Generator and output results
    const generator = new Generator(context);
    await generator.generateVideo(processedPost);

    notify(`Finished! Job completed at ${new Date().toLocaleTimeString()}`);
  }
}
