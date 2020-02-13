declare const SECTION_TITLE_PARAMS: {
  compName: string;
  fragments: import("../types/post").IPostSectionFragment[];
  author: string;
  score: number;
  audioLevelVoice: number;
  postDetails: import("../types/post").IProcessedPostDetails;
};

declare const SECTION_COMMENT_PARAMS: {
  compName: string;
  fragments: import("../types/post").IPostSectionFragment[];
  author: string;
  score: number;
  audioLevelVoice: number;
  children: import("../types/post").IPostSection[];
  delay: number;
};

declare const BG_MUSIC_PARAMS: {
  compName: string;
  filePath: string;
  audioLevel: number;
};
