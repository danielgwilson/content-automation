export interface IProcessedPost {
  id: string;
  dateProcessed: Date;

  stats: IProcessedPostStats;

  details: IProcessedPostDetails;
  sections: IPostSection[];
}

export interface IProcessedPostDetails {
  subredditName: string;
  numComments: number;
  upvoteRatio?: number;
  subredditIcon: { fileName: string; filePath: string };
}

export interface IProcessedPostStats {
  characters: number;
  audioLength: number;
}

export interface IPostSection {
  type: "title" | "comment" | "reply";

  fragments: IPostSectionFragment[];
  length: number;

  author: string;
  score: number;

  children: IPostSection[];
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
