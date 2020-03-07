import fetch from "node-fetch";
import { ISubreddit } from "../../types";

export async function getSubreddit(name: string) {
  const subredditJson = await fetchSubredditJson(name);
  const subreddit = await parseSubreddit(subredditJson);

  return subreddit;
}

async function fetchSubredditJson(subreddit: string) {
  const uri = "https://www.reddit.com";

  const result = await fetch(`${uri}/r/${subreddit}.json`);
  const json = await result.json();

  return json;
}

function parseSubreddit(subredditJson: any) {
  const { data } = subredditJson;

  return {
    name: data.display_name,
    iconUri: data.icon_img
  } as ISubreddit;
}
