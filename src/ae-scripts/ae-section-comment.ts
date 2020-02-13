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
    !SECTION_COMMENT_PARAMS.children
  )
    throw new Error("Script missing required parameter.");

  const {
    compName,
    fragments,
    author,
    score,
    audioLevelVoice,
    children
  } = SECTION_COMMENT_PARAMS;

  const refComp = getComp(compName);
  const comp = app.project.items.addComp(
    `${compName}.${fragments[0].audio.fileName}`,
    refComp.width,
    refComp.height,
    refComp.pixelAspect,
    refComp.duration,
    refComp.frameRate
  );

  const commentBGLayer = copyLayerToComp(
    { name: "comment-bg", comp: refComp },
    { comp }
  ) as ShapeLayer;
  const collapseCommentBarLayer = copyLayerToComp(
    { name: "collapse-comment-bar", comp: refComp },
    { comp }
  ) as ShapeLayer;
  const upvoteArrowLayer = copyLayerToComp(
    { name: "upvote-arrow", comp: refComp },
    { comp }
  ) as TextLayer;
  const downvoteArrowLayer = copyLayerToComp(
    { name: "downvote-arrow", comp: refComp },
    { comp }
  ) as TextLayer;
  const userTextLayer = copyLayerToComp(
    { name: "user-text", comp: refComp },
    { comp }
  ) as TextLayer;
  const scoreTextLayer = copyLayerToComp(
    { name: "score-text", comp: refComp },
    { comp }
  ) as TextLayer;
  const commentTextLayer = copyLayerToComp(
    { name: "comment-text", comp: refComp },
    { comp }
  ) as TextLayer;

  const voLayers: AVLayer[] = [];
  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];

    // Add voiceover audio file
    const voLayer = addLayer(importFootage(fragment.audio.filePath), comp, {
      name: `audio.${fragment.audio.filePath}`
    });
    voLayer.startTime = i === 0 ? 0 : comp.layer(2).outPoint;
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

  // Add transition clip at outPoint of last voice-over audio clip
  const transitionLayer = addLayer(getFootageItem("transition-1s.mp4"), comp, {
    name: "transition"
  });
  transitionLayer.startTime = voLayers[voLayers.length - 1].outPoint;

  // Set the outPoint of the comment comp to match the length of the contents
  comp.duration = transitionLayer.outPoint;
})();
