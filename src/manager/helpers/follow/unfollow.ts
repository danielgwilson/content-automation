import path from "path";
import { getBlobs, BlobType } from "../../../util";
import {
  IContext,
  IFollowAction,
  IUnfollowAction,
  IFollowOutput,
  IUnfollowOutput,
} from "../../../types";
import Manager from "../../manager";
import { MAX_UNFOLLOWS } from "../../util";

export async function unfollowUsers(
  manager: Manager,
  { numUnfollows }: { numUnfollows?: number } = {}
) {
  if (numUnfollows !== undefined && numUnfollows > MAX_UNFOLLOWS)
    throw new Error(
      `numUnfollows of ${numUnfollows} exceeds the maximum number of unfollows per session (${MAX_UNFOLLOWS}) to avoid a shadow ban.`
    );

  const targetCount =
    numUnfollows !== undefined
      ? numUnfollows
      : MAX_UNFOLLOWS - 10 + Math.round(Math.random() * 10);
  console.log(`Attempting to unfollow ${targetCount} users.`);

  const follows = getOutstandingFollows(
    await getFollowUnfollowBlobs(manager.context)
  );
  console.log(follows);
}

/**
 * Gets follows from previous automated following sessions which do not have corresponding unfollows
 * @param context context containing outputDir path (directory containing follow/unfollow blob files (*.follow.json, *.unfollow.json))
 */
export function getOutstandingFollows({
  follows,
  unfollows,
}: {
  follows: IFollowOutput[];
  unfollows: IUnfollowOutput[];
}) {
  const followedUsers = follows.map((follow) =>
    follow.actionsTaken.map((action: IFollowAction) => action.target.username)
  );
  const unfollowedUsers = unfollows.map((unfollow) =>
    unfollow.actionsTaken.map(
      (action: IUnfollowAction) => action.target.username
    )
  );

  // Remove follows which have already been unfollowed
  const outstandingFollows: any[] = [];
  for (let followedUser of followedUsers) {
    if (unfollowedUsers.indexOf(followedUser) === -1)
      outstandingFollows.push(followedUser);
  }

  return outstandingFollows;
}

async function getFollowUnfollowBlobs(context: IContext) {
  const followDir = path.join(context.outputDir, "follows");
  const follows = await getBlobs(followDir, { type: BlobType.follow });
  const unfollows = await getBlobs(followDir, { type: BlobType.unfollow });

  return { follows, unfollows };
}
