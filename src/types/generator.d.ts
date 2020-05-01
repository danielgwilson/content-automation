export interface IGeneratorOutput {
  id: string;
  dateGenerated: Date;
  elapsedTime: number;

  media: { metadata: any; thumbnail: any; render: IRenderOutput };
}

export interface IRenderOutput {
  job: any;
  renderSettings: {
    workpath: string;
    maxMemoryPercent: number;
    skipCleanup: boolean;
    debug: boolean;
  };
}

export interface IVideoSettings {
  BG_MUSIC: string;
  AUDIO_LEVEL_BG: number;
  AUDIO_LEVEL_VOICE: number;
  TEMPLATE: string;
}
