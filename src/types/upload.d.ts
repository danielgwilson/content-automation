export interface IUploadOutput {
  id: string;
  dateUploaded: Date;
  context: import("./context").IContext;
  targetDir: string;
  outputName: string;
  videoPath: string;
  caption: string;
  tags: string[];
}
