import { URL, URLSearchParams } from "url";
import fetch from "node-fetch";
import { ISubreddit } from "../../types";

export async function getSubreddit(name: string) {
  const subredditJson = await fetchSubredditJson(name);
  const subreddit = await parseSubreddit(subredditJson);

  return subreddit;
}

async function fetchSubredditJson(subreddit: string) {
  const uri = "https://www.reddit.com";
  const endpoint = "about";
  const url = new URL(`${uri}/r/${subreddit}/about.json`);

  const result = await fetch(url);
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
