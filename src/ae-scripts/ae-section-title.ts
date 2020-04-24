/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources/ae-scripts/ae-util.js"

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
    postDetails,
  } = SECTION_TITLE_PARAMS;

  const refComp = getComp(compName);
  const comp = app.project.items.addComp(
    `${compName}.${fragments[0].audio.fileName}`,
    refComp.width,
    refComp.height,
    refComp.pixelAspect,
    refComp.duration,
    refComp.frameRate
  );

  for (let i = refComp.numLayers; i > 0; i--) {
    copyLayerToComp({ index: i, comp: refComp }, { comp });
  }

  // Add voiceover audio file
  const voLayer = addLayer(importFootage(fragments[0].audio.filePath), comp, {
    name: `audio.${fragments[0].audio.filePath}`,
  });
  voLayer.audio.audioLevels.setValue([audioLevelVoice, audioLevelVoice]);

  // Add fade out expression to avoid zero crossover point popping sounds
  voLayer.audio.audioLevels.expression = `
  fadeTime = 3; //frames for fade
  audio.audioLevelsMin = -48.0; 
  audio.audioLevelsMax = audio.audioLevels[0];
  layerDuration = outPoint - inPoint;
  singleFrame = thisComp.frameDuration;
  animateOut = linear(time, (outPoint - framesToTime(fadeTime+1)), (outPoint-singleFrame), audio.audioLevelsMax, audio.audioLevelsMin);
  [animateOut, animateOut];
  `;

  // Add subreddit icon
  const iconLayer = comp.layer("subreddit-icon") as AVLayer;
  iconLayer.replaceSource(
    importFootage(postDetails.subredditIcon.filePath),
    true
  );

  // Update title text
  updateTextLayer({ name: "title-text", comp }, fragments[0].text);

  // Update subreddit name
  updateTextLayer(
    { name: "subreddit-text", comp },
    "r/" + postDetails.subredditName
  );

  // Update author name
  updateTextLayer({ name: "user-text", comp }, "u/" + author);

  // Update number of comments
  const numCommentsText = get3Digits(postDetails.numComments);
  updateTextLayer(
    { name: "num-comments-text", comp },
    `${numCommentsText} Comments`
  );

  // Update score
  const scoreText = get3Digits(score);
  updateTextLayer({ name: "score-text", comp }, scoreText);

  // Update upvote ratio
  updateTextLayer(
    { name: "pct-upvoted-text", comp },
    `${Math.round(postDetails.upvoteRatio * 100)}% Upvoted`
  );

  // Add transition clip at outPoint of title comp
  const transitionLayer = addLayer(getFootageItem("transition-1s.mp4"), comp, {
    name: "transition-ref.title",
  });
  transitionLayer.startTime = voLayer.outPoint;

  // Change color scheme to light mode
  // setColorControls(comp);

  // Update comp outPoint to match voiceover outPoint
  comp.duration = transitionLayer.outPoint;
})();
