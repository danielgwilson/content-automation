/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"
(() => {
  // Check if required parameters are present
  if (
    !SECTION_COMMENT_PARAMS.compName ||
    !SECTION_COMMENT_PARAMS.fragments ||
    !SECTION_COMMENT_PARAMS.author ||
    !SECTION_COMMENT_PARAMS.score ||
    !SECTION_COMMENT_PARAMS.audioLevelVoice ||
    // !SECTION_COMMENT_PARAMS.children ||
    !SECTION_COMMENT_PARAMS.delay
  )
    throw new Error("Script missing required parameter.");

  const {
    compName,
    fragments,
    author,
    score,
    audioLevelVoice,
    // children,
    delay
  } = SECTION_COMMENT_PARAMS;

  const comp = getComp(compName);
  const commentComp = getComp(`${compName}.comment-comp`);

  const voLayers: AVLayer[] = [];

  const userTextLayer = duplicateLayer(
    "user-text",
    commentComp,
    `user-text.${fragments[0].audio.fileName}`
  ) as TextLayer;
  const scoreTextLayer = duplicateLayer(
    "score-text",
    commentComp,
    `score-text.${fragments[0].audio.fileName}`
  ) as TextLayer;
  const commentTextLayer = duplicateLayer(
    "comment-text",
    commentComp,
    `comment-text.${fragments[0].audio.fileName}`
  ) as TextLayer;
  const upvoteArrowLayer = duplicateLayer(
    "upvote-arrow",
    commentComp,
    `upvote-arrow.${fragments[0].audio.fileName}`
  ) as TextLayer;
  const downvoteArrowLayer = duplicateLayer(
    "downvote-arrow",
    commentComp,
    `downvote-arrow.${fragments[0].audio.fileName}`
  ) as TextLayer;
  const collapseCommentBarLayer = duplicateLayer(
    "collapse-comment-bar",
    commentComp,
    `collapse-comment-bar.${fragments[0].audio.fileName}`
  ) as TextLayer;
  const commentBGLayer = duplicateLayer(
    "comment-bg",
    commentComp,
    `comment-bg.${fragments[0].audio.fileName}`
  ) as TextLayer;

  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];
    const sectionDelay = i === 0 ? delay : 0;

    // Add voiceover audio file
    const voLayer = addLayer(importFootage(fragment.audio.filePath), comp, {
      name: `audio.${fragment.audio.filePath}`
    });
    voLayer.startTime = comp.layer(2).outPoint + sectionDelay;
    voLayer.audio.audioLevels.setValue([audioLevelVoice, audioLevelVoice]);
    voLayers.push(voLayer);
  }

  // Update comment text to show current fragment
  const textsWithPriors: string[] = [];
  const voInPoints: number[] = [];
  for (let i = 0; i < fragments.length; i++) {
    textsWithPriors.push(fragments[i].textWithPriors);
    voInPoints.push(voLayers[i].inPoint);
  }
  updateTextLayerAtTimes(commentTextLayer, textsWithPriors, voInPoints);

  // Update user text
  updateTextLayerAtTime(userTextLayer, author, voLayers[0].inPoint);

  // Update score text
  let scoreText = "";
  if (score < 999) scoreText = `${score} points`;
  else if (score < 99999) scoreText = `${Math.round(score / 100) / 10}k points`;
  else scoreText = `${Math.round(score / 1000)}k points`;
  updateTextLayerAtTime(scoreTextLayer, scoreText, voLayers[0].inPoint);

  // Add transition clip at outPoint of last voice-over audio clip
  const transitionLayer = addLayer(getFootageItem("transition-1s.mp4"), comp, {
    name: `transition-ref.${fragments[0].audio.fileName}`
  });
  transitionLayer.startTime = voLayers[voLayers.length - 1].outPoint;

  // Update UI visibility
  // Set inPoint and outPoint for all relevant layers
  for (let layer of [
    commentTextLayer,
    userTextLayer,
    scoreTextLayer,
    upvoteArrowLayer,
    downvoteArrowLayer,
    collapseCommentBarLayer,
    commentBGLayer
  ]) {
    layer.inPoint = voLayers[0].inPoint;
    layer.outPoint = voLayers[voLayers.length - 1].outPoint;
  }

  // Set the outPoint of the comment comp to match the length of the contents
  const commentCompLayer = comp.layer(`${compName}.comment-comp`);
  commentCompLayer.outPoint = voLayers[voLayers.length - 1].outPoint + delay;
})();
