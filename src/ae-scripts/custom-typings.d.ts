declare const NX: {
  get: (key: string) => any;
  call: (key: string, ...args: any[]) => any;
};

interface SectionTitleParams {
  compName: string;
  fragments: import('../types/post').IPostSectionFragment[];
  author: string;
  score: number;
  audioLevelVoice: number;
  postDetails: import('../types/post').IProcessedPostDetails;
}

declare const SECTION_COMMENT_PARAMS: {
  compName: string;
  section: import('../types/post').IPostSection;
  audioLevelVoice: number;
};

declare const BG_PARAMS: {
  compName: string;
  filePath: string;
  audioLevel: number;
  videoPath?: string;
};

declare const ASSEMBLE_MAIN_PARAMS: {
  compName: string;
  subCompNames: string[];
};
