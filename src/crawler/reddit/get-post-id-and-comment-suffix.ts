export function getPostIdAndCommentSuffix(postUri: string) {
  const pathArray = postUri.split("?")[0].split("/");
  const postId = pathArray[6];
  const commentSuffix = /^[a-zA-Z0-9]{6,}$/.test(pathArray[8])
    ? `/${pathArray[7]}/${pathArray[8]}`
    : undefined;

  return { postId, commentSuffix };
}
