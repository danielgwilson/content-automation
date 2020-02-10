import { Gildings } from "snoowrap/dist/objects/VoteableContent";

export interface IPost {
  id: string;
  dateCrawled: Date;

  outputDir: string;
  subredditName: string;
  postIndex: number;
  minWords: number;
  sort:
    | { type: "hot" }
    | {
        type: "top";
        time: "hour" | "day" | "week" | "month" | "year" | "all";
      };

  subredditIconURI: string;
  title: string;
  score: number;
  upvoteRatio: number;
  author: string;
  numComments: number;
  gildings: Gildings;

  comments: IPostComment[];
}

export interface IPostComment {
  author: string;
  score: number;
  body: string;
  body_html: string;
  gildings: Gildings;
  replies: IPostComment[];
}

export interface IProcessedPost {
  id: string;
  dateProcessed: Date;
  details: IProcessedPostDetails;
  sections: IPostSection[];
}

export interface IProcessedPostDetails {
  subredditName: string;
  numComments: number;
  upvoteRatio?: number;
  subredditIcon: { fileName: string; filePath: string };
}

export interface IPostSection {
  type: "title" | "comment";

  fragments: IPostSectionFragment[];
  length: number;

  author: string;
  score: number;
}

export interface IPostSectionFragment {
  text: string;
  textWithPriors: string;
  audio: IPostSectionFragmentAudio;
}

export interface IPostSectionFragmentAudio {
  filePath: string;
  fileName: string;
  length: number;
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: string;
  };
  audioConfig: {
    audioEncoding: string;
    speakingRate: number;
  };
}

export interface IGeneratorOutput {
  id: string;
  dateGenerated: Date;
  elapsedTime: number;

  media: IVideoOutput;
}

export interface IVideoOutput {
  job: any;
  settings: {
    workpath: string;
    maxMemoryPercent: number;
    skipCleanup: boolean;
    debug: boolean;
  };
}
