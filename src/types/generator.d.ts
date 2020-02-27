export interface IGeneratorOutput {
  id: string;
  dateGenerated: Date;
  elapsedTime: number;

  media: { metadata: any; thumbnail: any; render: IRenderOutput };
}

export interface IRenderOutput {
  job: any;
  settings: {
    workpath: string;
    maxMemoryPercent: number;
    skipCleanup: boolean;
    debug: boolean;
  };
}
