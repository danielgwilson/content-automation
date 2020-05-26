export interface IFollowOutput {
  sessionStart: Date;
  sessionEnd: Date;
  context: import("./context").IContext;
  account: string;
  tags: string[];
  actionsTaken: IFollowAction[];
  manager: {
    proxy;
    executablePath;
    timeout;
  };
}

export interface IFollowAction {
  timestamp: Date;
  target: IAccount;
}

export interface IAccount {
  username: string;
  following: number;
  followers: number;
  likes: number;
}
