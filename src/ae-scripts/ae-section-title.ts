/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/content-automation/lib/resources/ae-scripts/ae-util.js"

(() => {
  const compName = NX.get('compName');
  if (!compName)
    throw new Error(
      `Script 'ae-section-title.jsx' missing required parameter: 'compName'.`
    );
  const fragments = NX.get('fragments');
  if (!fragments)
    throw new Error(
      `Script 'ae-section-title.jsx' missing required parameter: 'fragments'.`
    );
  const author = NX.get('author');
  if (!author)
    throw new Error(
      `Script 'ae-section-title.jsx' missing required parameter: 'author'.`
    );
  const score = NX.get('score');
  if (!score)
    throw new Error(
      `Script 'ae-section-title.jsx' missing required parameter: 'score'.`
    );
  const audioLevelVoice = NX.get('audioLevelVoice');
  if (!audioLevelVoice)
    throw new Error(
      `Script 'ae-section-title.jsx' missing required parameter: 'audioLevelVoice'.`
    );
  const postDetails = NX.get('postDetails');
  if (!postDetails)
    throw new Error(
      `Script 'ae-section-title.jsx' missing required parameter: 'postDetails'.`
    );

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
  const iconLayer = comp.layer('subreddit-icon') as AVLayer;
  iconLayer.replaceSource(
    importFootage(postDetails.subredditIcon.filePath),
    true
  );

  // Update title text
  updateTextLayer({ name: 'title-text', comp }, fragments[0].text);

  // Update subreddit name
  updateTextLayer(
    { name: 'subreddit-text', comp },
    'r/' + postDetails.subredditName
  );

  // Update author name
  updateTextLayer({ name: 'user-text', comp }, 'u/' + author);

  // Update number of comments
  const numCommentsText = get3Digits(postDetails.numComments);
  updateTextLayer(
    { name: 'num-comments-text', comp },
    `${numCommentsText} Comments`
  );

  // Update score
  const scoreText = get3Digits(score);
  updateTextLayer({ name: 'score-text', comp }, scoreText);

  // Update upvote ratio
  updateTextLayer(
    { name: 'pct-upvoted-text', comp },
    `${Math.round(postDetails.upvoteRatio * 100)}% Upvoted`
  );

  // Add transition clip at outPoint of title comp
  const transitionLayer = addTransition(comp, voLayer);

  // Update comp outPoint to match transition outPoint
  comp.duration = transitionLayer.outPoint;

  // Set background position based on the background's (and thereby the title text's) size
  function updatePosition() {
    // Update BG y position as a function of height (keep text centered on screen)
    const bgLayer = comp.layer('post-bg') as ShapeLayer;

    const bgHeight: number = (bgLayer as any)
      .content('BG Rect')
      .content('Rectangle Path 1')
      .size.valueAtTime(comp.duration, false)[1];
    const xPos = (bgLayer.position.value as number[])[0];
    const yPos = Math.round(comp.height / 2 - bgHeight / 2);

    bgLayer.position.setValue([xPos, yPos]);
  }
  updatePosition();

  // Change color scheme to light mode
  // setColorControls(comp);
})();
