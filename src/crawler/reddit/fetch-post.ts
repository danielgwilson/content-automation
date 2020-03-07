import { URL, URLSearchParams } from "url";
import fetch from "node-fetch";

export async function fetchPostJson(postId: string, queryParams?: any) {
  const uri = "https://www.reddit.com";
  const endpoint = "comments";
  const url = new URL(`${uri}/${endpoint}/${postId}.json`);
  url.search = new URLSearchParams(queryParams).toString();

  const result = await fetch(url);
  const json = await result.json();

  return json;
}

export async function fetchPostJsonsForSubreddit(
  subredditName: string,
  sortType: "hot" | "top",
  subredditQueryParams?: any,
  postQueryParams?: any
) {
  const uri = "https://www.reddit.com";
  const endpoint = "r";
  const url = new URL(`${uri}/${endpoint}/${subredditName}/${sortType}.json`);
  url.search = new URLSearchParams(subredditQueryParams).toString();

  const result = await fetch(url);
  const json = await result.json();

  const links = json.data.children;
  const ids: string[] = links.map((link: any) => link.data.id);

  const jsons = await Promise.all(
    ids.map(async id => await fetchPostJson(id, postQueryParams))
  );

  return jsons;
}
