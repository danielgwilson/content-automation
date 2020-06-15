import path from "path";
import { getBlobs, BlobType } from "../../../util";
import {
  IContext,
  IFollowAction,
  IUnfollowAction,
  IFollowOutput,
  IUnfollowOutput,
} from "../../../types";

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
  const followActions = follows
    .map((follow) => follow.actionsTaken)
    .reduce((a, b) => a.concat(b), []);
  const unfollowActions = unfollows
    .map((unfollow) => unfollow.actionsTaken)
    .reduce((a, b) => a.concat(b), []);
  const latestFollowActions = getLatestActionsByTargetUsername(followActions);
  const latestUnfollowActions = getLatestActionsByTargetUsername(
    unfollowActions
  );

  // Ignores follows which have already been unfollowed
  const outstandingFollowActions: IFollowAction[] = [];
  for (let [username, followAction] of Object.entries(latestFollowActions)) {
    const unfollowAction = latestUnfollowActions[username];
    if (!unfollowAction || followAction.timestamp > unfollowAction.timestamp)
      outstandingFollowActions.push(followAction);
  }

  // Sort resulting usernames (outstandingFollows) by timestamp from oldest to newest
  const outstandingFollows = outstandingFollowActions
    .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    .map((followAction) => followAction.target.username);

  return outstandingFollows;
}

export function getLatestActionsByTargetUsername(
  actions: IFollowAction[] | IUnfollowAction[]
) {
  const dict: { [key: string]: typeof actions[0] } = {};
  for (let action of actions) {
    const { username } = action.target;
    // if no existing action for username OR existing action is older
    if (!dict[username] || dict[username].timestamp < action.timestamp) {
      dict[username] = action;
    }
  }
  return dict;
}

export async function getFollowUnfollowBlobs(context: IContext) {
  const followDir = path.join(context.outputDir, "follows");
  const follows = (await getBlobs(followDir, {
    type: BlobType.follow,
  })) as IFollowOutput[];
  const unfollows = (await getBlobs(followDir, {
    type: BlobType.unfollow,
  })) as IUnfollowOutput[];

  return { follows, unfollows };
}

export function getPreviouslyFollowedUsernames(follows: IFollowOutput[]) {
  // Get actions and flatten
  const usernames = follows
    .map((follow) => follow.actionsTaken)
    .reduce((a, b) => a.concat(b), [])
    .map((action) => action.target.username);
  return [...new Set(usernames)];
}
