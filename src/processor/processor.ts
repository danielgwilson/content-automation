import { IPost, IProcessedPost } from "../types/post";
import VoiceOverClient from "./voice-over";
import { getSections } from "./sections";
import { saveObjectToJson } from "../util";
import { fetchAndSaveFile } from "./fetch-and-save-file";

export default class {
  outputDir: string;
  voiceOverClient: VoiceOverClient;
  constructor({
    outputDir,
    GOOGLE_APPLICATION_CREDENTIALS
  }: {
    outputDir: string;
    GOOGLE_APPLICATION_CREDENTIALS: string;
  }) {
    this.outputDir = outputDir;
    this.voiceOverClient = new VoiceOverClient({
      outputDir,
      GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  async process(
    post: IPost,
    { saveOutputToFile = false }: { saveOutputToFile?: boolean } = {}
  ) {
    const [sections, subredditIcon] = await Promise.all([
      await getSections(post, this.voiceOverClient),
      await fetchAndSaveFile(post.subredditIconURI, {
        fileName: "subreddit-icon.png",
        outputDir: this.outputDir
      })
    ]);

    const processedPost = {
      id: post.id,
      dateProcessed: new Date(),
      details: {
        subredditName: post.subredditName,
        numComments: post.numComments,
        upvoteRatio: post.upvoteRatio,
        subredditIcon
      },
      sections
    } as IProcessedPost;

    if (saveOutputToFile)
      saveObjectToJson(processedPost, {
        fileName: `${
          processedPost.id
        }.${processedPost.dateProcessed.toISOString()}.processor.json`,
        outputDir: this.outputDir
      });

    return processedPost;
  }
}
