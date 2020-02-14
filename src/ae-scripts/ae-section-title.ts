/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"

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

  // const postBGLayer = copyLayerToComp(
  //   { name: "post-bg", comp: refComp },
  //   { comp }
  // ) as ShapeLayer;
  // const subredditIconPlaceholderLayer = copyLayerToComp(
  //   { name: "subreddit-icon-placeholder", comp: refComp },
  //   { comp }
  // ) as ShapeLayer;
  // const subredditTextLayer = copyLayerToComp(
  //   { name: "subreddit-text", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const subredditTextDotLayer = copyLayerToComp(
  //   { name: "subreddit-text-dot", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const userTextLayer = copyLayerToComp(
  //   { name: "user-text", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const upvoteArrowLayer = copyLayerToComp(
  //   { name: "upvote-arrow", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const downvoteArrowLayer = copyLayerToComp(
  //   { name: "downvote-arrow", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const scoreTextLayer = copyLayerToComp(
  //   { name: "score-text", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const numCommentsIconLayer = copyLayerToComp(
  //   { name: "num-comments-icon", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const numCommentsTextLayer = copyLayerToComp(
  //   { name: "num-comments-text", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const pctUpvotedTextLayer = copyLayerToComp(
  //   { name: "pct-upvoted-text", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const titleTextLayer = copyLayerToComp(
  //   { name: "title-text", comp: refComp },
  //   { comp }
  // ) as TextLayer;
  // const subredditIconLayer = copyLayerToComp(
  //   { name: "subreddit-icon", comp: refComp },
  //   { comp }
  // ) as AVLayer;

  // Add voiceover audio file
  const voLayer = addLayer(importFootage(fragments[0].audio.filePath), comp, {
    name: `audio.${fragments[0].audio.filePath}`
  });
  voLayer.audio.audioLevels.setValue([audioLevelVoice, audioLevelVoice]);

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
  updateTextLayer(
    { name: "num-comments-text", comp },
    postDetails.numComments > 999
      ? `${Math.round(postDetails.numComments / 100) / 10}k Comments`
      : `${postDetails.numComments} Comments`
  );

  // Update score
  updateTextLayer(
    { name: "score-text", comp },
    score > 999 ? `${Math.round(score / 100) / 10}k` : `${score}`
  );

  // Add transition clip at outPoint of title comp
  const transitionLayer = addLayer(getFootageItem("transition-1s.mp4"), comp, {
    name: "transition-ref.title"
  });
  transitionLayer.startTime = voLayer.outPoint;

  // Update comp outPoint to match voiceover outPoint
  comp.duration = transitionLayer.outPoint;
})();
