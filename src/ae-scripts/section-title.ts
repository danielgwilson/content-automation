/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/util.js"
(() => {
  // Check if required parameters are present
  if (
    !SECTION_TITLE_PARAMS.compName ||
    !SECTION_TITLE_PARAMS.fragments ||
    !SECTION_TITLE_PARAMS.author ||
    !SECTION_TITLE_PARAMS.score ||
    !SECTION_TITLE_PARAMS.audioLevelVoice ||
    !SECTION_TITLE_PARAMS.postDetails
  )
    throw new Error("Script missing required parameter.");

  const {
    compName,
    fragments,
    author,
    score,
    audioLevelVoice,
    postDetails
  } = SECTION_TITLE_PARAMS;

  const comp = getComp(compName);
  const titleComp = getComp(`${compName}.title-comp`);

  // Add voiceover audio file
  const voLayer = addLayer(importFootage(fragments[0].audio.filePath), comp, {
    name: `audio.${fragments[0].audio.filePath}`
  });
  voLayer.audio.audioLevels.setValue([audioLevelVoice, audioLevelVoice]);

  // Update title comp outPoint to match voiceover outPoint
  const titleCompLayer = comp.layer(`${compName}.title-comp`);
  titleCompLayer.outPoint = voLayer.outPoint;

  // Add subreddit icon
  const iconLayer = titleComp.layer("subreddit-icon-ref") as AVLayer;
  iconLayer.replaceSource(
    importFootage(postDetails.subredditIcon.filePath),
    true
  );

  // Update title text
  updateTextLayer("title-text", fragments[0].text, titleComp);

  // Update subreddit name
  updateTextLayer(
    "subreddit-text",
    "r/" + postDetails.subredditName,
    titleComp
  );

  // Update author name
  updateTextLayer("user-text", "u/" + author, titleComp);

  // Update number of comments
  updateTextLayer(
    "num-comments-text",
    postDetails.numComments > 999
      ? `${Math.round(postDetails.numComments / 100) / 10}k Comments`
      : `${postDetails.numComments} Comments`,
    titleComp
  );

  // Update score
  updateTextLayer(
    "score-text",
    score > 999 ? `${Math.round(score / 100) / 10}k` : `${score}`,
    titleComp
  );

  // Set the inPoint of the comment comp to right after the title comp finishes
  const commentCompLayer = comp.layer(`${compName}.comment-comp`);
  commentCompLayer.inPoint = titleCompLayer.outPoint;

  // Add transition clip at outPoint of title comp
  const transitionLayer = addLayer(getFootageItem("transition-1s.mp4"), comp, {
    name: "transition-ref.title"
  });
  transitionLayer.startTime = voLayer.outPoint;
})();
