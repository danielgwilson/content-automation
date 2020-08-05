interface IManagerOutput {
  proxy?: import("./proxy").IProxy;
  executablePath?: string;
  timeout?: number;
  browserType: string;
}
