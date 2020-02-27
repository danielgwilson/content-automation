import path from "path";
import {
  IContext,
  IPost,
  IProcessedPost,
  IProcessedPostDetails,
  IProcessedPostStats
} from "../types";
import VoiceOverClient from "./voice-over";
import {
  getSections,
  getCharacters,
  getAudioLengthForSections
} from "./sections";
import { saveObjectToJson } from "../util";
import { fetchAndSaveFile } from "./fetch-and-save-file";

export default class {
  context: IContext;
  voiceOverClient: VoiceOverClient;
  constructor(
    context: IContext,
    {
      GOOGLE_APPLICATION_CREDENTIALS
    }: {
      GOOGLE_APPLICATION_CREDENTIALS: string;
    }
  ) {
    this.context = context;
    this.voiceOverClient = new VoiceOverClient(context, {
      GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  async process(post: IPost): Promise<IProcessedPost> {
    const { saveOutputToFile } = this.context;
    const subDir = `/${post.id}/`;
    const outputDir = path.join(this.context.outputDir, subDir);
    const dateProcessed = new Date();

    const [sections, subredditIcon] = await Promise.all([
      await getSections(post, this.voiceOverClient),
      await fetchAndSaveFile(post.details.subredditIconURI, {
        fileName: "subreddit-icon.png",
        outputDir
      })
    ]);
    const totalCharacters = getCharacters(sections);
    const totalAudioLength = getAudioLengthForSections(sections);
    console.log(`\nTotal characters converted to audio: ${totalCharacters}`);
    console.log(
      `Aggregate length of audio files: ${new Date(totalAudioLength * 1000)
        .toISOString()
        .substr(11, 8)}\n`
    );
    const postStats = {
      characters: totalCharacters,
      audioLength: totalAudioLength
    } as IProcessedPostStats;

    const postDetails = {
      subredditName: post.details.subredditName,
      numComments: post.details.numComments,
      upvoteRatio: post.details.upvoteRatio,
      subredditIcon
    } as IProcessedPostDetails;

    const processedPost = {
      id: post.id,
      dateProcessed,

      stats: postStats,

      details: postDetails,
      sections
    } as IProcessedPost;

    if (saveOutputToFile) {
      const fileName = `${processedPost.id}.processor.json`;
      await saveObjectToJson(processedPost, {
        fileName,
        outputDir
      });
      console.log(`Saved output to file named ${fileName}`);
    }

    return processedPost;
  }
}
