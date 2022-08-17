import path from "path";
import {
  IContext,
  IPost,
  IProcessedPost,
  IProcessedPostDetails,
  IProcessedPostStats,
  IProcessedPostOptions,
} from "../types";
import VoiceOverClient from "./voice-over";
import {
  getSections,
  getCharacters,
  getAudioLengthForSections,
} from "./sections";
import { saveObjectToJson } from "../util";
import { fetchAndSaveFile, trimComments } from "./util";
import { trimAudio } from "./util/trim-audio";

export default class {
  context: IContext;
  voiceOverClient: VoiceOverClient;
  constructor(
    context: IContext,
    {
      GOOGLE_APPLICATION_CREDENTIALS,
    }: {
      GOOGLE_APPLICATION_CREDENTIALS: string;
    }
  ) {
    this.context = context;
    this.voiceOverClient = new VoiceOverClient({
      GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async process(
    post: IPost,
    options: IProcessedPostOptions = {}
  ): Promise<IProcessedPost> {
    const { saveOutputToFile } = this.context;
    const {
      maxRepliesPerComment = 2,
      maxReplyDepth = 2,
      maxComments = -1,
      maxAudioLength = 15 * 60,
      speakingRate = 1.05,
    } = options;
    const subDir = `/${post.id}/`;
    const outputDir = path.join(this.context.outputDir, subDir);
    const dateProcessed = new Date();

    post = trimComments(post, {
      maxRepliesPerComment,
      maxReplyDepth,
      maxComments,
    });

    const [sections, subredditIcon] = await Promise.all([
      await getSections(post, this.voiceOverClient, outputDir, {
        speakingRate,
      }),
      await fetchAndSaveFile(post.details.subreddit.iconUri, {
        fileName: "subreddit-icon.png",
        outputDir,
      }),
    ]);

    const trimmedSections = trimAudio(sections, { maxAudioLength });

    const totalCharacters = getCharacters(trimmedSections);
    const totalAudioLength = getAudioLengthForSections(trimmedSections);
    console.log(`\nTotal characters converted to audio: ${totalCharacters}`);
    console.log(
      `Aggregate length of audio files: ${new Date(totalAudioLength * 1000)
        .toISOString()
        .substr(11, 8)}\n`
    );
    if (totalAudioLength > maxAudioLength)
      throw new Error(
        `Total audio length exceeds max audio length of ${maxAudioLength}s`
      );

    const postStats = {
      characters: totalCharacters,
      audioLength: totalAudioLength,
    } as IProcessedPostStats;

    const postDetails = {
      postId: post.details.postId,
      title: post.details.title,
      subredditName: post.details.subreddit.name,
      numComments: post.details.numComments,
      upvoteRatio: post.details.upvoteRatio,
      subredditIcon,
    } as IProcessedPostDetails;

    const processedPost = {
      id: post.id,
      dateProcessed,

      stats: postStats,

      details: postDetails,
      sections: trimmedSections,
    } as IProcessedPost;

    if (saveOutputToFile) {
      const fileName = `${processedPost.id}.processor.json`;
      await saveObjectToJson(processedPost, {
        fileName,
        outputDir,
      });
      console.log(`Saved output to file named ${fileName}`);
    }

    return processedPost;
  }
}
