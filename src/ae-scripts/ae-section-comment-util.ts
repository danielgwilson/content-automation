//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources/ae-scripts/ae-util.js"

interface ContentComp {
  comp: CompItem;
  keyframes: {
    time: number;
    height: number;
  }[];
}

function createCommentContentComp(
  refComp: CompItem,
  newCompName: string,
  section: import("../types/processed-post").IPostSection,
  audioLevelVoice: number,
  subCommentLevel: number = 0
): ContentComp {
  // Create new comment content comp
  const thisComp = app.project.items.addComp(
    newCompName,
    refComp.width,
    refComp.height,
    refComp.pixelAspect,
    refComp.duration,
    refComp.frameRate
  );

  // Copy content layers from refComp
  for (let i = refComp.numLayers; i > 0; i--) {
    const layer = refComp.layer(i);
    if (layer.name === "comment-bg" && subCommentLevel > 0) continue;
    copyLayerToComp({ index: i, comp: refComp }, { comp: thisComp });
  }
  const nullLayer = thisComp.layer("null-parent");

  // Voice-overs
  const voLayers: AVLayer[] = [];
  for (let i = 0; i < section.fragments.length; i++) {
    const fragment = section.fragments[i];

    // Add voice-over audio file
    const voLayer = addLayer(importFootage(fragment.audio.filePath), thisComp, {
      name: `audio.${fragment.audio.filePath}`,
    });
    voLayer.startTime = i === 0 ? 0 : thisComp.layer(2).outPoint;
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

    voLayers.push(voLayer);
  }
  const voOutPoint = voLayers[voLayers.length - 1].outPoint;

  // Move layers over if child comment / reply
  if (subCommentLevel) {
    // Resize child comment text box to account for less space on the right side
    const upvoteArrowLayer = thisComp.layer("upvote-arrow") as TextLayer;
    const xOffset =
      subCommentLevel * (upvoteArrowLayer.position.value as number[])[0]; // amount child reply comments are shifted over
    const commentTextLayer = thisComp.layer("comment-text") as TextLayer;
    const commentTextDoc = commentTextLayer.text.sourceText.value as any;
    commentTextDoc.boxTextSize = [
      commentTextDoc.boxTextSize[0] - xOffset,
      commentTextDoc.boxTextSize[1],
    ];
    commentTextLayer.text.sourceText.setValue(commentTextDoc);
  }

  // Update comment text to show current fragment
  for (let i = 0; i < section.fragments.length; i++) {
    const textWithPriors = section.fragments[i].textWithPriors;
    const voInPoint = voLayers[i].inPoint;
    const commentTextLayer = thisComp.layer("comment-text") as TextLayer;
    commentTextLayer.text.sourceText.setValueAtTime(
      voInPoint,
      new TextDocument(textWithPriors)
    );
  }

  // Get height values for newly keyframed comment text layer
  // NOTE: figured out that text layer sourceRectAtTime() lags by a frame
  const keyframes: { time: number; height: number }[] = [];
  for (let i = 0; i < voLayers.length; i++) {
    const time = voLayers[i].inPoint;
    const commentTextLayer = thisComp.layer("comment-text") as TextLayer;
    const yPos = (commentTextLayer.position.value as number[])[1];
    const commentTextHeight = commentTextLayer.sourceRectAtTime(
      time + thisComp.frameDuration, // because of sourceRectAtTime() single frame lag, add one frame to time to get size AFTER text has been updated
      false
    ).height;
    const distFromTop = yPos + commentTextHeight; // get total dist from top of comp
    keyframes.push({ time, height: distFromTop });
  }

  // Update user text
  updateTextLayerAtTime(
    thisComp.layer("user-text") as TextLayer,
    section.author,
    voLayers[0].inPoint
  );

  // Update score text
  let scoreText = "";
  if (section.score < 999) scoreText = `${section.score} points`;
  else if (section.score < 99999)
    scoreText = `${Math.round(section.score / 100) / 10}k points`;
  else scoreText = `${Math.round(section.score / 1000)}k points`;
  updateTextLayerAtTime(
    thisComp.layer("score-text") as TextLayer,
    scoreText,
    voLayers[0].inPoint
  );

  const contentComps = addChildren(
    section.children,
    thisComp,
    refComp,
    newCompName,
    audioLevelVoice,
    subCommentLevel,
    voOutPoint
  );
  for (let contentComp of contentComps) {
    keyframes.push(...contentComp.keyframes);
  }

  // Update collapse comment bar size (and BG if it exists)
  for (let keyframe of keyframes) {
    updateCollapseCommentBar(thisComp, keyframe);
    if (subCommentLevel === 0) updateBGSizeAndPos(thisComp, keyframe);
  }

  // Set the outPoint of the comment comp to match the length of the contents
  thisComp.duration = thisComp.layer(1).outPoint;

  resizeCompToContents(thisComp);

  // Change color scheme to light mode
  // setColorControls(thisComp);

  return { comp: thisComp, keyframes };
}

function resizeCompToContents(comp: CompItem) {
  // Resize comp to contain only contents (when fully expanded)
  // Since we know the anchor point will be the top left of the comp, find farthest bottom-right point
  let width: number = 0;
  let height: number = 0;

  for (let i = 1; i <= comp.numLayers; i++) {
    const layer = comp.layer(i);
    if (
      layer instanceof AVLayer &&
      (layer as AVLayer).source instanceof CompItem
    ) {
      const childLayer = layer as AVLayer;
      const childComp = getComp(childLayer.name);
      width = Math.max(
        width,
        (childLayer.position.value as number[])[0] + childComp.width
      );
      height = Math.max(
        height,
        (childLayer.position.value as number[])[1] + childComp.height
      );
    } else if (layer.name === "comment-text") {
      const commentTextLayer = layer as TextLayer;
      const rect = commentTextLayer.sourceRectAtTime(comp.duration, false);
      width = Math.max(
        width,
        (commentTextLayer.position.value as number[])[0] + rect.width
      );
      height = Math.max(
        height,
        (commentTextLayer.position.value as number[])[1] + rect.height
      );
    } else if (layer.name === "comment-bg") {
      const bgLayer = layer as TextLayer;
      const bgSize = (bgLayer as any)
        .content("Rectangle 1")
        .content("Rectangle Path 1").size;
      width = Math.max(width, bgSize.valueAtTime(comp.duration, false)[0]);
      height = Math.max(height, bgSize.valueAtTime(comp.duration, false)[1]);
    }
  }

  // comp size must be integer valued (and bigger than contents -> ceil)
  comp.width = Math.ceil(width);
  comp.height = Math.ceil(height);
}

// Handle reply comments
function addChildren(
  children: import("../types/processed-post").IPostSection[],
  comp: CompItem,
  refComp: CompItem,
  newCompName: string,
  audioLevelVoice: number,
  subCommentLevel: number,
  voOutPoint: number
): ContentComp[] {
  const contentComps: ContentComp[] = [];
  const contentCompLayers: AVLayer[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Create reply subcomp
    const contentComp = createCommentContentComp(
      refComp,
      `${newCompName}.${i}`,
      child,
      audioLevelVoice,
      subCommentLevel + 1
    );

    // Add child content comp to current comp
    const contentCompLayer = comp.layers.add(contentComp.comp);
    contentCompLayers.push(contentCompLayer);
    contentCompLayer.startTime =
      i === 0 ? voOutPoint : contentCompLayers[i - 1].outPoint;
    contentCompLayer.anchorPoint.setValue([0, 0]);

    // Reposition subcomp
    const nullLayer = comp.layer("null-parent");
    // const childNullLayer = childComp.layer("null-parent");
    const upvoteArrowLayer = comp.layer("upvote-arrow") as TextLayer;
    const xPos = (upvoteArrowLayer.position.value as number[])[0]; // where subCommentLevel represents rank of subcomment
    let yPos = 0;
    if (i === 0) {
      const commentTextLayer = comp.layer("comment-text") as TextLayer;
      yPos =
        (commentTextLayer.position.value as number[])[1] +
        commentTextLayer.sourceRectAtTime(voOutPoint, false).height +
        0.5 *
          ((commentTextLayer.position.value as number[])[1] -
            (nullLayer.position.value as number[])[1]);
    } else {
      yPos =
        (contentCompLayers[i - 1].position.value as number[])[1] +
        contentComps[i - 1].comp.height;
    }

    contentCompLayer.position.setValue([xPos, yPos]);

    // Adjust keyframes of childComp to be relevant to current comp
    const adjustedKeyframes: { time: number; height: number }[] = [];
    for (let keyframe of contentComp.keyframes) {
      const { time, height } = keyframe;
      adjustedKeyframes.push({
        time: time + contentCompLayer.startTime,
        height: height + (contentCompLayer.position.value as number[])[1],
      });
    }
    contentComps.push({ comp: contentComp.comp, keyframes: adjustedKeyframes });

    // Enable time remapping at last frame so outPoint can be extended based on top level comment's duration
    // contentCompLayer.timeRemapEnabled = true;
    // contentCompLayer.timeRemap.setInterpolationTypeAtKey(
    //   2,
    //   KeyframeInterpolationType.HOLD
    // );
  }

  return contentComps;
}

// Update collapse comment bar size
function updateCollapseCommentBar(
  comp: CompItem,
  keyframe: { time: number; height: number }
) {
  const barLayer = comp.layer("collapse-comment-bar") as ShapeLayer;
  const yPos = (barLayer.position.value as number[])[1];
  const barSize = (barLayer as any)
    .content("Rectangle 1")
    .content("Rectangle Path 1").size;
  const barWidth = 5;
  const barHeight = keyframe.height - yPos;
  barSize.setValueAtTime(keyframe.time, [barWidth, barHeight]);
  barSize.setInterpolationTypeAtKey(
    barSize.nearestKeyIndex(keyframe.time),
    KeyframeInterpolationType.HOLD
  );
}

// Update bg size to contain contents
function updateBGSizeAndPos(
  comp: CompItem,
  keyframe: { time: number; height: number }
) {
  const bgLayer = comp.layer("comment-bg");
  const bgSize = (bgLayer as any)
    .content("Rectangle 1")
    .content("Rectangle Path 1").size;
  const paddingBottom = 60;
  const bgWidth = bgSize.value[0];

  // Update BG height
  const bgHeight = keyframe.height + paddingBottom;
  bgSize.setValueAtTime(keyframe.time, [bgWidth, bgHeight]);
  bgSize.setInterpolationTypeAtKey(
    bgSize.nearestKeyIndex(keyframe.time),
    KeyframeInterpolationType.HOLD
  );
}
