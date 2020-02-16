//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"

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
  section: import("../types/post").IPostSection,
  audioLevelVoice: number,
  layerOffset: number = 0
): ContentComp {
  // Create new comment content comp
  const comp = app.project.items.addComp(
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
    if (layer.name === "comment-bg") continue;
    copyLayerToComp({ index: i, comp: refComp }, { comp });
  }
  const nullLayer = comp.layer("null-parent");

  // Voice-overs
  const voLayers: AVLayer[] = [];
  for (let i = 0; i < section.fragments.length; i++) {
    const fragment = section.fragments[i];

    // Add voice-over audio file
    const voLayer = addLayer(importFootage(fragment.audio.filePath), comp, {
      name: `audio.${fragment.audio.filePath}`
    });
    voLayer.startTime = i === 0 ? 0 : comp.layer(2).outPoint;
    voLayer.audio.audioLevels.setValue([audioLevelVoice, audioLevelVoice]);
    voLayers.push(voLayer);
  }
  const voOutPoint = voLayers[voLayers.length - 1].outPoint;

  // Move layers over if child comment / reply
  if (layerOffset) {
    // Resize child comment text box to account for less space on the right side
    const commentTextLayer = comp.layer("comment-text") as TextLayer;
    const commentTextDoc = commentTextLayer.text.sourceText.value as any;
    commentTextDoc.boxTextSize = [
      commentTextDoc.boxTextSize[0] -
        layerOffset * (nullLayer.position.value as number[])[0],
      commentTextDoc.boxTextSize[1]
    ];
    commentTextLayer.text.sourceText.setValue(commentTextDoc);
  }

  // Update comment text to show current fragment
  const textsWithPriors: string[] = [];
  const voInPoints: number[] = [];
  for (let i = 0; i < section.fragments.length; i++) {
    textsWithPriors.push(section.fragments[i].textWithPriors);
    voInPoints.push(voLayers[i].inPoint);
  }
  updateTextLayerAtTimes(
    comp.layer("comment-text") as TextLayer,
    textsWithPriors,
    voInPoints
  );

  // Get height values for newly keyframed comment text layer
  const keyframes: { time: number; height: number }[] = [];
  for (let i = 0; i < voLayers.length; i++) {
    const time = voLayers[i].inPoint;
    const height = (comp.layer("comment-text") as TextLayer).sourceRectAtTime(
      time,
      false
    ).height;
    keyframes.push({ time, height });
  }

  // Update user text
  updateTextLayerAtTime(
    comp.layer("user-text") as TextLayer,
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
    comp.layer("score-text") as TextLayer,
    scoreText,
    voLayers[0].inPoint
  );

  const contentComps = addChildren(
    section.children,
    comp,
    refComp,
    newCompName,
    audioLevelVoice,
    layerOffset,
    voOutPoint
  );
  for (let contentComp of contentComps) {
    keyframes.push(...contentComp.keyframes);
  }

  // Update collapse comment bar size
  function updateCollapseCommentBar() {
    const barLayer = comp.layer("collapse-comment-bar") as ShapeLayer;
    const yPos = (barLayer.position.value as number[])[1];
    const barSize = (barLayer as any)
      .content("Rectangle 1")
      .content("Rectangle Path 1").size;
    const barWidth = 5;
    for (let keyframe of keyframes) {
      const barHeight = keyframe.height - yPos;
      barSize.setValueAtTime(keyframe.time, [barWidth, barHeight]);
    }
  }
  updateCollapseCommentBar();

  // Update UI visibility
  // Set inPoint and outPoint for all relevant layers
  // Also parent the layers to the null object for alignment
  for (let layerName of [
    "comment-text",
    "user-text",
    "score-text",
    "upvote-arrow",
    "downvote-arrow",
    "collapse-comment-bar",
    "null-parent"
  ]) {
    const layer = comp.layer(layerName) as Layer;
    if (!layer)
      throw new Error(
        `Failed to find layer named "${layerName}" in comp "${comp.name}"`
      );
    layer.inPoint = voLayers[0].inPoint;
    layer.outPoint = comp.layer(1).outPoint;
    if (layerName !== "null-parent") layer.parent = nullLayer;
  }

  // Set the outPoint of the comment comp to match the length of the contents
  comp.duration = comp.layer(1).outPoint;

  resizeCompToContents(comp);

  return { comp, keyframes };
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
      const childLayer = comp.layer(1);
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
    }
  }

  // comp size must be integer valued (and bigger than contents -> ceil)
  comp.width = Math.ceil(width);
  comp.height = Math.ceil(height);
}

// Handle reply comments
function addChildren(
  children: import("../types/post").IPostSection[],
  comp: CompItem,
  refComp: CompItem,
  newCompName: string,
  audioLevelVoice: number,
  layerOffset: number,
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
      layerOffset + 1
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
    const xPos = (upvoteArrowLayer.position.value as number[])[0]; // where layerOffset represents rank of subcomment
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
        contentComp.comp.height;
    }

    contentCompLayer.position.setValue([xPos, yPos]);

    // Adjust keyframes of childComp to be relevant to current comp
    const adjustedKeyframes: { time: number; height: number }[] = [];
    for (let keyframe of contentComp.keyframes) {
      const { time, height } = keyframe;
      adjustedKeyframes.push({
        time: time + contentCompLayer.startTime,
        height: height + (contentCompLayer.position.value as number[])[1]
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
