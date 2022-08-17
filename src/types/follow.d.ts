export interface IFollowOutput {
  sessionStart: Date;
  sessionEnd: Date;
  context: import("./context").IContext;
  account: string;
  tags: string[];
  actionsTaken: IFollowAction[];
  manager: {
    proxy?: string | string[];
    executablePath: string;
    timeout: number;
  };
}

export interface IFollowCriteria {
  isPrivate: boolean | null;
  maxFollowers: number | null;
  minFollowers: number | null;
  maxFollowing: number | null;
  minFollowing: number | null;
}

export interface IFollowAction {
  timestamp: Date;
  target: IUser;
}

export interface IUser {
  username: string;
  isPrivate?: boolean;
  following?: number;
  followers?: number;
  likes?: number;
}

export interface IUnfollowOutput {
  sessionStart: Date;
  sessionEnd: Date;
  context: import("./context").IContext;
  account: string;
  actionsTaken: IUnfollowAction[];
  manager: {
    proxy?: string | string[];
    executablePath: string;
    timeout: number;
  };
}

export interface IUnfollowAction {
  timestamp: Date;
  target: IUser;
  followedBack: boolean;
}
